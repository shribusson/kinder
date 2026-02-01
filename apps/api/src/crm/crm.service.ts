import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Prisma, DealStage, InteractionChannel, LeadStage } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { QUEUE_NAMES } from '../queue/queue.module';
import { WebhookJobData } from "../queue/processors/webhook.processor";

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.WEBHOOKS) private webhooksQueue: Queue<WebhookJobData>,
  ) {}

  async listLeads(search?: string, source?: string, stage?: LeadStage) {
    return this.prisma.lead.findMany({
      where: {
        source: source || undefined,
        stage: stage || undefined,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createLead(data: {
    accountId: string;
    name: string;
    phone?: string;
    email?: string;
    source: string;
    stage?: LeadStage;
    utm?: Record<string, string | undefined>;
  }) {
    const lead = await this.prisma.lead.create({
      data: {
        account: { connect: { id: data.accountId } },
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        stage: data.stage ?? LeadStage.new,
        utmSource: data.utm?.utm_source,
        utmMedium: data.utm?.utm_medium,
        utmCampaign: data.utm?.utm_campaign,
        utmContent: data.utm?.utm_content,
        utmTerm: data.utm?.utm_term
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "Lead",
        entityId: lead.id,
        meta: { source: lead.source }
      }
    });
    return lead;
  }

  async listDeals(search?: string, stage?: DealStage) {
    return this.prisma.deal.findMany({
      where: {
        stage: stage || undefined,
        OR: search
          ? [{ title: { contains: search, mode: "insensitive" } }]
          : undefined
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createDeal(data: {
    accountId: string;
    leadId: string;
    title: string;
    stage?: DealStage;
    amount: number;
  }) {
    const deal = await this.prisma.deal.create({
      data: {
        account: { connect: { id: data.accountId } },
        lead: { connect: { id: data.leadId } },
        title: data.title,
        stage: data.stage ?? DealStage.new,
        amount: data.amount
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "Deal",
        entityId: deal.id,
        meta: { amount: deal.amount }
      }
    });
    return deal;
  }

  async listBookings() {
    return this.prisma.booking.findMany({
      orderBy: { scheduledAt: "asc" }
    });
  }

  async createBooking(data: {
    accountId: string;
    leadId: string;
    specialist: string;
    scheduledAt: string;
    status: string;
  }) {
    const booking = await this.prisma.booking.create({
      data: {
        account: { connect: { id: data.accountId } },
        lead: { connect: { id: data.leadId } },
        specialist: data.specialist,
        scheduledAt: new Date(data.scheduledAt),
        status: data.status
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "Booking",
        entityId: booking.id,
        meta: { specialist: booking.specialist }
      }
    });
    return booking;
  }

  async listCampaigns() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async createCampaign(data: {
    accountId: string;
    name: string;
    source: string;
    spend: number;
    leads: number;
  }) {
    const campaign = await this.prisma.campaign.create({
      data: {
        account: { connect: { id: data.accountId } },
        name: data.name,
        source: data.source,
        spend: data.spend,
        leads: data.leads
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "Campaign",
        entityId: campaign.id,
        meta: { spend: campaign.spend }
      }
    });
    return campaign;
  }

  async analyticsSummary() {
    const leads = await this.prisma.lead.count();
    const deals = await this.prisma.deal.findMany();
    const revenue = deals.reduce((sum, deal) => sum + (deal.revenue ?? deal.amount), 0);
    const avgCheck = deals.length ? Math.round(revenue / deals.length) : 0;
    const plan = await this.prisma.salesPlan.findFirst({
      orderBy: { createdAt: "desc" }
    });

    return {
      leads,
      deals: deals.length,
      revenue,
      avgCheck,
      revenuePlan: plan?.target ?? 0
    };
  }

  async utmReport() {
    const grouped = await this.prisma.lead.groupBy({
      by: ["utmSource", "utmMedium"],
      _count: { _all: true }
    });
    return grouped.map((row) => ({
      utm: `${row.utmSource ?? "unknown"} / ${row.utmMedium ?? "unknown"}`,
      leads: row._count._all
    }));
  }

  async recordInteraction(accountId: string, channel: InteractionChannel, payload: Record<string, unknown>) {
    const interaction = await this.prisma.interaction.create({
      data: {
        account: { connect: { id: accountId } },
        channel,
        direction: "inbound",
        payload: payload as Prisma.InputJsonValue
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: accountId } },
        action: "create",
        entity: "Interaction",
        entityId: interaction.id,
        meta: { channel }
      }
    });
    return interaction;
  }

  async enqueueWebhook(channel: InteractionChannel, payload: Record<string, unknown>) {
    // Create webhook event record
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        channel,
        payload: payload as Prisma.InputJsonValue,
        status: "received",
        attempts: 0
      }
    });

    // Add to processing queue
    await this.webhooksQueue.add(
      {
        webhookEventId: webhookEvent.id,
        channel,
        payload,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5 seconds initial delay
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: false, // Keep failed jobs for inspection
      }
    );

    return webhookEvent;
  }

  async retryWebhook(id: string, error?: string) {
    return this.prisma.webhookEvent.update({
      where: { id },
      data: {
        status: error ? "failed" : "processed",
        attempts: { increment: 1 },
        lastError: error
      }
    });
  }

  async getIntegration(id: string) {
    return this.prisma.integration.findUnique({
      where: { id }
    });
  }

  async getIntegrationByChannel(accountId: string, channel: InteractionChannel) {
    return this.prisma.integration.findUnique({
      where: {
        accountId_channel: { accountId, channel }
      }
    });
  }

  async getDefaultAccount() {
    return this.prisma.account.findFirst({
      orderBy: { createdAt: 'asc' }
    });
  }

  // ============================================
  // LEAD OPERATIONS
  // ============================================

  async getLead(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        deals: true,
        bookings: true
      }
    });
  }

  async updateLead(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      source?: string;
      stage?: LeadStage;
      utm?: Record<string, string | undefined>;
    }
  ) {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        stage: data.stage,
        utmSource: data.utm?.utm_source,
        utmMedium: data.utm?.utm_medium,
        utmCampaign: data.utm?.utm_campaign,
        utmContent: data.utm?.utm_content,
        utmTerm: data.utm?.utm_term
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: lead.accountId } },
        action: "update",
        entity: "Lead",
        entityId: lead.id,
        meta: { changes: data }
      }
    });
    return lead;
  }

  async deleteLead(id: string) {
    const lead = await this.prisma.lead.delete({
      where: { id }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: lead.accountId } },
        action: "delete",
        entity: "Lead",
        entityId: lead.id,
        meta: { name: lead.name }
      }
    });
    return lead;
  }

  async updateLeadStage(id: string, stage: LeadStage) {
    return this.prisma.lead.update({
      where: { id },
      data: { stage }
    });
  }

  // ============================================
  // DEAL OPERATIONS
  // ============================================

  async getDeal(id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      include: {
        lead: true
      }
    });
  }

  async updateDeal(
    id: string,
    data: {
      title?: string;
      stage?: DealStage;
      amount?: number;
      revenue?: number;
    }
  ) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: deal.accountId } },
        action: "update",
        entity: "Deal",
        entityId: deal.id,
        meta: { changes: data }
      }
    });
    return deal;
  }

  async deleteDeal(id: string) {
    const deal = await this.prisma.deal.delete({
      where: { id }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: deal.accountId } },
        action: "delete",
        entity: "Deal",
        entityId: deal.id,
        meta: { title: deal.title }
      }
    });
    return deal;
  }

  async updateDealStage(id: string, stage: DealStage) {
    return this.prisma.deal.update({
      where: { id },
      data: { stage }
    });
  }

  // ============================================
  // BOOKING OPERATIONS
  // ============================================

  async getBooking(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        lead: true
      }
    });
  }

  async updateBooking(
    id: string,
    data: {
      specialist?: string;
      scheduledAt?: string;
      status?: string;
    }
  ) {
    const updateData: any = { ...data };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }
    const booking = await this.prisma.booking.update({
      where: { id },
      data: updateData
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: booking.accountId } },
        action: "update",
        entity: "Booking",
        entityId: booking.id,
        meta: { changes: data }
      }
    });
    return booking;
  }

  async cancelBooking(id: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" }
    });
  }

  async updateBookingStatus(id: string, status: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status }
    });
  }

  // ============================================
  // CAMPAIGN OPERATIONS
  // ============================================

  async getCampaign(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id }
    });
  }

  async updateCampaign(
    id: string,
    data: {
      name?: string;
      source?: string;
      spend?: number;
      leads?: number;
    }
  ) {
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: campaign.accountId } },
        action: "update",
        entity: "Campaign",
        entityId: campaign.id,
        meta: { changes: data }
      }
    });
    return campaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.campaign.delete({
      where: { id }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: campaign.accountId } },
        action: "delete",
        entity: "Campaign",
        entityId: campaign.id,
        meta: { name: campaign.name }
      }
    });
    return campaign;
  }

  // ============================================
  // SALES PLAN OPERATIONS
  // ============================================

  async getSalesPlans(accountId: string) {
    return this.prisma.salesPlan.findMany({
      where: { accountId },
      orderBy: { period: "desc" }
    });
  }

  async getSalesPlan(id: string) {
    return this.prisma.salesPlan.findUnique({
      where: { id }
    });
  }

  async createSalesPlan(data: {
    accountId: string;
    period: string;
    target: number;
  }) {
    const plan = await this.prisma.salesPlan.create({
      data
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "SalesPlan",
        entityId: plan.id,
        meta: { period: plan.period, target: plan.target }
      }
    });
    return plan;
  }

  async updateSalesPlan(
    id: string,
    data: {
      period?: string;
      target?: number;
    }
  ) {
    const plan = await this.prisma.salesPlan.update({
      where: { id },
      data
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: plan.accountId } },
        action: "update",
        entity: "SalesPlan",
        entityId: plan.id,
        meta: { changes: data }
      }
    });
    return plan;
  }

  async deleteSalesPlan(id: string) {
    const plan = await this.prisma.salesPlan.delete({
      where: { id }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: plan.accountId } },
        action: "delete",
        entity: "SalesPlan",
        entityId: plan.id,
        meta: { period: plan.period }
      }
    });
    return plan;
  }
}
