import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateSalesPlanDto, UpdateSalesPlanDto } from "./dto";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("crm/sales-plans")
export class SalesPlansController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async list(@Query("accountId") accountId: string) {
    return this.crm.getSalesPlans(accountId);
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.crm.getSalesPlan(id);
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateSalesPlanDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createSalesPlan({ ...payload, accountId: membership.accountId });
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateSalesPlanDto) {
    return this.crm.updateSalesPlan(id, payload);
  }

  @Delete(":id")
  @Roles("admin")
  async delete(@Param("id") id: string) {
    return this.crm.deleteSalesPlan(id);
  }
}
