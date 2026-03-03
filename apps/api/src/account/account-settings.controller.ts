import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthenticatedRequest } from '../common/types/request.types';
import { Roles } from '../common/roles.decorator';

@Controller('account')
export class AccountSettingsController {
  constructor(private prisma: PrismaService) {}

  private async getAccountId(req: AuthenticatedRequest): Promise<string> {
    if (req.user.accountId) return req.user.accountId;
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return membership.accountId;
  }

  @Get('settings')
  async getSettings(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { settings: true, workOrderSettings: true },
    });
    return {
      success: true,
      data: {
        settings: account?.settings || {},
        workOrderSettings: account?.workOrderSettings || {},
      },
    };
  }

  @Patch('settings')
  @Roles('admin')
  async updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() body: { workOrderSettings?: any; settings?: any },
  ) {
    const accountId = await this.getAccountId(req);
    const data: any = {};
    if (body.workOrderSettings !== undefined) {
      data.workOrderSettings = body.workOrderSettings;
    }
    if (body.settings !== undefined) {
      data.settings = body.settings;
    }
    const account = await this.prisma.account.update({
      where: { id: accountId },
      data,
      select: { settings: true, workOrderSettings: true },
    });
    return {
      success: true,
      data: {
        settings: account.settings || {},
        workOrderSettings: account.workOrderSettings || {},
      },
    };
  }
}
