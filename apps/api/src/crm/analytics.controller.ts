import { Controller, Get, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("crm/analytics")
export class AnalyticsController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  private async getAccountId(req: AuthenticatedRequest): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return membership.accountId;
  }

  @Get("summary")
  async summary(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.crm.analyticsSummary(accountId);
  }

  @Get("utm")
  async utm(@Req() req: AuthenticatedRequest) {
    const accountId = await this.getAccountId(req);
    return this.crm.utmReport(accountId);
  }
}
