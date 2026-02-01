import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateCampaignDto, UpdateCampaignDto } from "./dto";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

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
  async create(@Body() payload: CreateCampaignDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createCampaign({ ...payload, accountId: membership.accountId });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.crm.getCampaign(id);
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateCampaignDto) {
    return this.crm.updateCampaign(id, payload);
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string) {
    return this.crm.deleteCampaign(id);
  }
}
