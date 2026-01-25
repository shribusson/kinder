import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateCampaignDto } from "./dto";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";

@Controller("crm/campaigns")
export class CampaignsController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  @Get()
  list() {
    return this.crm.listCampaigns();
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateCampaignDto, @Req() req: any) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.id },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createCampaign({ ...payload, accountId: membership.accountId });
  }
}
