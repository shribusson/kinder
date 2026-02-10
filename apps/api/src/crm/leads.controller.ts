import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CrmService } from "./crm.service";
import { CreateLeadDto, UpdateLeadDto } from "./dto";
import { toCsv } from "./csv";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../prisma.service";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("crm/leads")
export class LeadsController {
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

  @Get()
  async list(
    @Req() req: AuthenticatedRequest,
    @Query("q") search?: string,
    @Query("source") source?: string,
    @Query("stage") stage?: string
  ) {
    const accountId = await this.getAccountId(req);
    return this.crm.listLeads(accountId, search, source, stage as never);
  }

  @Get("export")
  async export(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const accountId = await this.getAccountId(req);
    const leads = await this.crm.listLeads(accountId);
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
  async create(@Body() payload: CreateLeadDto, @Req() req: AuthenticatedRequest) {
    // Get accountId from user's membership
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) {
      throw new Error('No account found');
    }
    return this.crm.createLead({ ...payload, accountId: membership.accountId });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.crm.getLead(id);
  }

  @Patch(":id")
  @Roles("admin", "manager")
  async update(@Param("id") id: string, @Body() payload: UpdateLeadDto) {
    return this.crm.updateLead(id, payload);
  }

  @Delete(":id")
  @Roles("admin", "manager")
  async delete(@Param("id") id: string) {
    return this.crm.deleteLead(id);
  }

  @Put(":id/stage")
  @Roles("admin", "manager")
  async updateStage(@Param("id") id: string, @Body() payload: { stage: string }) {
    return this.crm.updateLeadStage(id, payload.stage as never);
  }
}
