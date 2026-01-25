import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CrmService } from "./crm.service";
import { CreateLeadDto } from "./dto";
import { toCsv } from "./csv";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";

@Controller("crm/leads")
export class LeadsController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  @Get()
  list(
    @Query("q") search?: string,
    @Query("source") source?: string,
    @Query("stage") stage?: string
  ) {
    return this.crm.listLeads(search, source, stage as never);
  }

  @Get("export")
  async export(@Res() res: Response) {
    const leads = await this.crm.listLeads();
    const csv = toCsv(
      leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone ?? "",
        email: lead.email ?? "",
        source: lead.source,
        stage: lead.stage,
        createdAt: lead.createdAt.toISOString()
      }))
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send(csv);
  }

  @Post()
  @Roles("admin", "manager")
  async create(@Body() payload: CreateLeadDto, @Req() req: any) {
    // Get accountId from user's membership
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.id },
    });
    if (!membership) {
      throw new Error('No account found');
    }
    return this.crm.createLead({ ...payload, accountId: membership.accountId });
  }
}
