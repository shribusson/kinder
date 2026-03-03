import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Req, Res } from "@nestjs/common";
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

  private async getAccountId(req: AuthenticatedRequest): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');
    return membership.accountId;
  }

  private async getMechanicResourceId(req: AuthenticatedRequest, accountId: string): Promise<string | null> {
    const resourceByUser = await this.prisma.resource.findFirst({
      where: {
        accountId,
        userId: req.user.sub,
        type: 'specialist',
        isActive: true,
      },
      select: { id: true },
    });
    if (resourceByUser) return resourceByUser.id;

    if (!req.user.email) return null;

    const resourceByEmail = await this.prisma.resource.findFirst({
      where: {
        accountId,
        email: req.user.email,
        type: 'specialist',
        isActive: true,
      },
      select: { id: true },
    });
    return resourceByEmail?.id ?? null;
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query("q") search?: string, @Query("stage") stage?: string) {
    const accountId = await this.getAccountId(req);
    return this.crm.listDeals(accountId, search, stage as never);
  }

  @Get("export")
  async export(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const accountId = await this.getAccountId(req);
    const deals = await this.crm.listDeals(accountId);
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
  @Roles("admin", "manager", "mechanic")
  async create(@Body() payload: CreateDealDto, @Req() req: AuthenticatedRequest) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: req.user.sub },
    });
    if (!membership) throw new Error('No account');

    let assignedResourceId: string | undefined;
    if (req.user.role === 'mechanic') {
      assignedResourceId = (await this.getMechanicResourceId(req, membership.accountId)) ?? undefined;
      if (!assignedResourceId) {
        throw new ForbiddenException('Специалист не привязан к активному ресурсу');
      }
    }

    return this.crm.createDeal({
      ...payload,
      accountId: membership.accountId,
      assignedResourceId,
    });
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
  async updateStage(@Param("id") id: string, @Body() payload: { stage: string; failReason?: string }) {
    return this.crm.updateDealStage(id, payload.stage as never, payload.failReason);
  }
}
