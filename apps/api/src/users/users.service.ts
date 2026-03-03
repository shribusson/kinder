import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.user.findMany({
      where: { accountId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, accountId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, accountId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    accountId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: UserRole;
      isActive?: boolean;
      password?: string;
    },
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, accountId } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string, accountId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, accountId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'superadmin') {
      throw new BadRequestException('Cannot delete superadmin user');
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
