import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CrmService } from "./crm.service";
import { CreateDealDto } from "./dto";
import { toCsv } from "./csv";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";

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
  async create(@Body() payload: CreateDealDto, @Req() req: any) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.id },
    });
    if (!membership) throw new Error('No account');
    return this.crm.createDeal({ ...payload, accountId: membership.accountId });
  }
}
