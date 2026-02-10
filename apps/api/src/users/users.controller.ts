import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { Roles } from '../common/roles.decorator';
import { AuthenticatedRequest } from '../common/types/request.types';
import { UserRole } from '@prisma/client';

@Controller('users')
@Roles('admin', 'manager')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  private async getAccountId(req: AuthenticatedRequest): Promise<string> {
    if (req.user.accountId) return req.user.accountId;
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return membership.accountId;
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    const users = await this.usersService.findAll(accountId);
    return { success: true, data: users };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    const user = await this.usersService.findOne(id, accountId);
    return { success: true, data: user };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: UserRole;
      isActive?: boolean;
      password?: string;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = await this.getAccountId(req);
    const user = await this.usersService.update(id, accountId, data);
    return { success: true, data: user };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    await this.usersService.remove(id, accountId);
    return { success: true };
  }
}
