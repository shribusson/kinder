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
import { Roles } from '../common/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@Roles('admin', 'manager')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: any) {
    const users = await this.usersService.findAll(req.user.accountId);
    return { success: true, data: users };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.findOne(id, req.user.accountId);
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
    @Req() req: any,
  ) {
    const user = await this.usersService.update(id, req.user.accountId, data);
    return { success: true, data: user };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.usersService.remove(id, req.user.accountId);
    return { success: true };
  }
}
