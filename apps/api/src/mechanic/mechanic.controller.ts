import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MechanicService } from './mechanic.service';
import { PrismaService } from '../prisma.service';
import { Roles } from '../common/roles.decorator';
import { AuthenticatedRequest } from '../common/types/request.types';
import { StartTimerDto, StopTimerDto, QuickCreateDealDto, CreateWorkLogDto, UpdateChecklistDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('deals/quick-create')
  async quickCreate(
    @Body() dto: QuickCreateDealDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = await this.getAccountId(req);
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const deal = await this.mechanicService.quickCreateDeal(accountId, resourceId, dto);
    return { success: true, data: deal };
  }

  @Post('deals/:id/logs')
  async createWorkLog(
    @Param('id') dealId: string,
    @Body() dto: CreateWorkLogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = await this.getAccountId(req);
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const log = await this.mechanicService.createWorkLog(accountId, resourceId, dealId, dto);
    return { success: true, data: log };
  }

  @Get('deals/:id/logs')
  async listWorkLogs(
    @Param('id') dealId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = await this.getAccountId(req);
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const logs = await this.mechanicService.listWorkLogs(accountId, resourceId, dealId);
    return { success: true, data: logs };
  }

  @Patch('logs/:id/checklist')
  async updateChecklist(
    @Param('id') logId: string,
    @Body() dto: UpdateChecklistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const accountId = await this.getAccountId(req);
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const log = await this.mechanicService.updateChecklist(accountId, resourceId, logId, dto.checklist);
    return { success: true, data: log };
  }

  @Post('logs/:id/media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogMedia(
    @Param('id') logId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    const accountId = await this.getAccountId(req);
    const resourceId = await this.mechanicService.getResourceIdForUser(req.user);
    if (!resourceId) {
      return { success: false, error: 'User is not associated with a mechanic resource' };
    }
    const media = await this.mechanicService.attachMedia(accountId, resourceId, logId, file);
    return { success: true, data: media };
  }
}
