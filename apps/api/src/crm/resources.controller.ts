import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

export class CreateResourceDto {
  name!: string;
  type!: "specialist" | "room" | "equipment";
  email?: string;
  phone?: string;
  workingHours?: Record<string, unknown>;
}

export class UpdateResourceDto {
  name?: string;
  type?: "specialist" | "room" | "equipment";
  email?: string;
  phone?: string;
  workingHours?: Record<string, unknown>;
  isActive?: boolean;
}

@Controller("crm/resources")
export class ResourcesController {
  constructor(
    private prisma: PrismaService,
  ) {}

  @Get()
  async list(@Query("accountId") accountId: string) {
    return this.prisma.resource.findMany({
      where: { accountId },
      orderBy: { name: "asc" }
    });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.prisma.resource.findUnique({
      where: { id }
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
        workingHours: payload.workingHours as any,
      }
    });

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
  async update(@Param("id") id: string, @Body() payload: UpdateResourceDto) {
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
        workingHours: payload.workingHours as any,
        isActive: payload.isActive,
      }
    });

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
