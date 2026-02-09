import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MechanicService } from './mechanic.service';
import { Roles } from '../common/roles.decorator';
import { StartTimerDto, StopTimerDto } from './dto';

@Controller('mechanic')
@Roles('mechanic', 'admin', 'manager')
export class MechanicController {
  constructor(private mechanicService: MechanicService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const dashboard = await this.mechanicService.getDashboard(resourceId, req.user.accountId);
    return { success: true, data: dashboard };
  }

  @Get('deals/:id')
  async getDealDetails(@Param('id') dealId: string, @Req() req: any) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const deal = await this.mechanicService.getDealDetails(dealId, resourceId, req.user.accountId);
    return { success: true, data: deal };
  }

  @Post('time/start')
  async startTimer(@Body() dto: StartTimerDto, @Req() req: any) {
    const timeEntry = await this.mechanicService.startTimer(dto.dealId, dto.resourceId, req.user.accountId);
    return { success: true, data: timeEntry };
  }

  @Put('time/:id/stop')
  async stopTimer(@Param('id') timeEntryId: string, @Body() dto: StopTimerDto, @Req() req: any) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const timeEntry = await this.mechanicService.stopTimer(timeEntryId, resourceId, req.user.accountId, dto.notes);
    return { success: true, data: timeEntry };
  }

  @Get('time/active')
  async getActiveTimer(@Req() req: any) {
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: true, data: null };
    }
    const timer = await this.mechanicService.getActiveTimer(resourceId, req.user.accountId);
    return { success: true, data: timer };
  }
}
