import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Prisma, DealStage, InteractionChannel, LeadStage } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { QUEUE_NAMES } from "../queue/queue.module";
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
}
