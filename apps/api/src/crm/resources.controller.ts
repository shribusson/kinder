import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { CrmService } from "./crm.service";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";
import * as bcrypt from 'bcrypt';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @IsEnum(['specialist', 'room', 'equipment'], { message: 'Invalid resource type' })
  @IsNotEmpty({ message: 'Type is required' })
  type!: 'specialist' | 'room' | 'equipment';

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Hourly rate must be a number' })
  @Min(0, { message: 'Hourly rate must be positive' })
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  workingHours?: Record<string, unknown>;

  // Поля для создания аккаунта механика (только для type === 'specialist')
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password?: string;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(['specialist', 'room', 'equipment'], { message: 'Invalid resource type' })
  type?: 'specialist' | 'room' | 'equipment';

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Hourly rate must be a number' })
  @Min(0, { message: 'Hourly rate must be positive' })
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  workingHours?: Record<string, unknown>;

  // Поля для создания аккаунта механика
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password?: string;
}

@Controller("crm/resources")
export class ResourcesController {
  constructor(
    private prisma: PrismaService,
  ) {}

  @Get()
  async list(@Query("accountId") accountId?: string, @Req() req?: AuthenticatedRequest) {
    let resolvedAccountId = accountId;
    if (!resolvedAccountId && req?.user?.sub) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: req.user.sub },
      });
      resolvedAccountId = membership?.accountId;
    }
    return this.prisma.resource.findMany({
      where: resolvedAccountId ? { accountId: resolvedAccountId } : {},
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } } },
      orderBy: { name: "asc" }
    });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } } },
    });
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateResourceDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');

    const resource = await this.prisma.resource.create({
      data: {
        accountId: membership.accountId,
        name: payload.name,
        type: payload.type,
        email: payload.email,
        phone: payload.phone,
        hourlyRate: payload.hourlyRate,
        isActive: payload.isActive ?? true,
        workingHours: payload.workingHours as any,
      }
    });

    // Автоматически создать аккаунт механика для specialist
    if (payload.type === 'specialist' && payload.username && payload.password) {
      const passwordHash = await bcrypt.hash(payload.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: payload.username,
          passwordHash,
          firstName: payload.name.split(' ')[0] || payload.name,
          lastName: payload.name.split(' ').slice(1).join(' ') || '',
          phone: payload.phone,
          role: 'mechanic',
          accountId: membership.accountId,
          isActive: true,
        },
      });

      // Связать пользователя с ресурсом
      await this.prisma.resource.update({
        where: { id: resource.id },
        data: { userId: user.id },
      });

      // Создать Membership для связи user с account
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          accountId: membership.accountId,
          role: 'mechanic',
          permissions: {},
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: membership.accountId } },
        action: "create",
        entity: "Resource",
        entityId: resource.id,
        meta: { name: resource.name, type: resource.type }
      }
    });

    return resource;
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateResourceDto, @Req() req: AuthenticatedRequest) {
    const resource = await this.prisma.resource.findUnique({
      where: { id }
    });
    if (!resource) throw new Error('Resource not found');

    const updated = await this.prisma.resource.update({
      where: { id },
      data: {
        name: payload.name,
        type: payload.type,
        email: payload.email,
        phone: payload.phone,
        hourlyRate: payload.hourlyRate,
        isActive: payload.isActive,
        workingHours: payload.workingHours as any,
      }
    });

    // Создать аккаунт механика если запрошено и ещё нет привязки
    if (!resource.userId && payload.username && payload.password) {
      const passwordHash = await bcrypt.hash(payload.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: payload.username,
          passwordHash,
          firstName: (payload.name || resource.name).split(' ')[0] || resource.name,
          lastName: (payload.name || resource.name).split(' ').slice(1).join(' ') || '',
          phone: payload.phone || resource.phone,
          role: 'mechanic',
          accountId: resource.accountId,
          isActive: true,
        },
      });

      await this.prisma.resource.update({
        where: { id },
        data: { userId: user.id },
      });

      await this.prisma.membership.create({
        data: {
          userId: user.id,
          accountId: resource.accountId,
          role: 'mechanic',
          permissions: {},
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: resource.accountId } },
        action: "update",
        entity: "Resource",
        entityId: resource.id,
        meta: { changes: payload } as any
      }
    });

    return updated;
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id }
    });
    if (!resource) throw new Error('Resource not found');

    const deleted = await this.prisma.resource.delete({
      where: { id }
    });

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: resource.accountId } },
        action: "delete",
        entity: "Resource",
        entityId: resource.id,
        meta: { name: resource.name }
      }
    });

    return deleted;
  }

  @Get(":id/availability")
  async getAvailability(
    @Param("id") id: string,
    @Query("start") start: string,
    @Query("end") end: string
  ) {
    // Get all bookings for this resource in the given date range
    const bookings = await this.prisma.booking.findMany({
      where: {
        specialist: (await this.prisma.resource.findUnique({ where: { id } }))?.name || "",
        scheduledAt: {
          gte: new Date(start),
          lte: new Date(end)
        }
      },
      select: {
        scheduledAt: true,
        status: true
      }
    });

    return {
      resourceId: id,
      start,
      end,
      bookings
    };
  }
}
