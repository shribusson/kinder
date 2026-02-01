import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CrmService } from "./crm.service";
import { CreateDealDto, UpdateDealDto } from "./dto";
import { toCsv } from "./csv";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("crm/deals")
export class DealsController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  @Get()
  list(@Query("q") search?: string, @Query("stage") stage?: string) {
    return this.crm.listDeals(search, stage as never);
  }

  @Get("export")
  async export(@Res() res: Response) {
    const deals = await this.crm.listDeals();
    const csv = toCsv(
      deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        stage: deal.stage,
        amount: deal.amount,
        revenue: deal.revenue ?? "",
        createdAt: deal.createdAt.toISOString()
      }))
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=deals.csv");
    res.send(csv);
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateDealDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createDeal({ ...payload, accountId: membership.accountId });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.crm.getDeal(id);
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateDealDto) {
    return this.crm.updateDeal(id, payload);
  }

  @Delete(":id")
  @Roles("admin", "manager")
  async delete(@Param("id") id: string) {
    return this.crm.deleteDeal(id);
  }

  @Put(":id/stage")
  @Roles("admin", "manager")
  async updateStage(@Param("id") id: string, @Body() payload: { stage: string }) {
    return this.crm.updateDealStage(id, payload.stage as never);
  }
}
