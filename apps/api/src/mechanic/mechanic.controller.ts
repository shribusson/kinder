import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { MechanicService } from './mechanic.service';
import { PrismaService } from '../prisma.service';
import { Roles } from '../common/roles.decorator';
import { AuthenticatedRequest } from '../common/types/request.types';
import { StartTimerDto, StopTimerDto } from './dto';

@Controller('mechanic')
@Roles('mechanic', 'admin', 'manager')
export class MechanicController {
  constructor(
    private mechanicService: MechanicService,
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

  @Get('dashboard')
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'Нет специалистов. Создайте ресурс типа "Специалист" в настройках.' };
    }
    const accountId = await this.getAccountId(req);
    const dashboard = await this.mechanicService.getDashboard(resourceId, accountId);
    return { success: true, data: dashboard };
  }

  @Get('deals/:id')
  async getDealDetails(@Param('id') dealId: string, @Req() req: AuthenticatedRequest) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const accountId = await this.getAccountId(req);
    const deal = await this.mechanicService.getDealDetails(dealId, resourceId, accountId);
    return { success: true, data: deal };
  }

  @Post('time/start')
  async startTimer(@Body() dto: StartTimerDto, @Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    const timeEntry = await this.mechanicService.startTimer(dto.dealId, dto.resourceId, accountId);
    return { success: true, data: timeEntry };
  }

  @Put('time/:id/stop')
  async stopTimer(@Param('id') timeEntryId: string, @Body() dto: StopTimerDto, @Req() req: AuthenticatedRequest) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const accountId = await this.getAccountId(req);
    const timeEntry = await this.mechanicService.stopTimer(timeEntryId, resourceId, accountId, dto.notes);
    return { success: true, data: timeEntry };
  }

  @Get('time/active')
  async getActiveTimer(@Req() req: AuthenticatedRequest) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: true, data: null };
    }
    const accountId = await this.getAccountId(req);
    const timer = await this.mechanicService.getActiveTimer(resourceId, accountId);
    return { success: true, data: timer };
  }
}
