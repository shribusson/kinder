import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { Prisma, DealStage, InteractionChannel, LeadStage } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { QUEUE_NAMES } from '../queue/queue.constants';
import { WebhookJobData } from "../queue/processors/webhook.processor";

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.WEBHOOKS) private webhooksQueue: Queue<WebhookJobData>,
  ) {}

  private normalizeDealMetadata(metadata: Prisma.JsonValue | null): Record<string, unknown> {
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      return { ...(metadata as Record<string, unknown>) };
    }
    return {};
  }

  private normalizeLeadMetadata(metadata: Prisma.JsonValue | null): Record<string, unknown> {
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      return { ...(metadata as Record<string, unknown>) };
    }
    return {};
  }

  private extractVehicleIdsFromLeadMetadata(metadata: Record<string, unknown>): string[] {
    const raw = metadata.vehicleIds;
    if (!Array.isArray(raw)) return [];
    return raw.filter((value): value is string => typeof value === 'string' && value.length > 0);
  }

  private async resolveOrCreateVehicle(
    accountId: string,
    vehicleData: {
      brandId: string;
      modelId: string;
      year?: number;
      vin?: string;
      licensePlate?: string;
      color?: string;
      mileage?: number;
    },
  ): Promise<string> {
    const normalizedVin = vehicleData.vin?.trim() || undefined;
    const normalizedPlate = vehicleData.licensePlate?.trim() || undefined;

    let existingVehicle = null;
    if (normalizedVin) {
      existingVehicle = await this.prisma.vehicle.findUnique({
        where: { accountId_vin: { accountId, vin: normalizedVin } },
      });
    }

    if (!existingVehicle && normalizedPlate) {
      existingVehicle = await this.prisma.vehicle.findUnique({
        where: { accountId_licensePlate: { accountId, licensePlate: normalizedPlate } },
      });
    }

    if (existingVehicle) {
      return existingVehicle.id;
    }

    const newVehicle = await this.prisma.vehicle.create({
      data: {
        accountId,
        brandId: vehicleData.brandId,
        modelId: vehicleData.modelId,
        year: vehicleData.year,
        vin: normalizedVin || null,
        licensePlate: normalizedPlate || null,
        color: vehicleData.color || null,
        mileage: vehicleData.mileage,
      },
    });

    return newVehicle.id;
  }

  private validateCancelledReason(stage: DealStage, metadata: Record<string, unknown>, failReason?: string) {
    if (stage !== DealStage.cancelled) {
      delete metadata.failReason;
      return;
    }

    const reasonFromPayload = failReason?.trim();
    const reasonFromMetadata =
      typeof metadata.failReason === 'string' ? metadata.failReason.trim() : '';
    const resolvedReason = reasonFromPayload || reasonFromMetadata;

    if (!resolvedReason) {
      throw new BadRequestException('Для стадии "Провал" нужно указать причину');
    }

    metadata.failReason = resolvedReason;
  }

  private validateGuaranteeBeforeSuccess(stage: DealStage, metadata: Record<string, unknown>) {
    if (stage !== DealStage.closed) return;

    const guaranteeRaw = metadata.guaranteeUntil;
    if (typeof guaranteeRaw !== 'string' || !guaranteeRaw) return;

    const guaranteeDate = new Date(guaranteeRaw);
    if (Number.isNaN(guaranteeDate.getTime())) return;

    if (guaranteeDate.getTime() > Date.now()) {
      throw new BadRequestException('Нельзя перевести в "Успех" до окончания гарантийного срока');
    }
  }

  async listLeads(accountId: string, search?: string, source?: string, stage?: LeadStage) {
    return this.prisma.lead.findMany({
      where: {
        accountId,
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
    vehicleData?: {
      brandId: string;
      modelId: string;
      year?: number;
      vin?: string;
      licensePlate?: string;
      color?: string;
      mileage?: number;
    };
  }) {
    const leadMetadata = this.normalizeLeadMetadata(null);
    if (data.vehicleData?.brandId && data.vehicleData?.modelId) {
      const vehicleId = await this.resolveOrCreateVehicle(data.accountId, data.vehicleData);
      leadMetadata.vehicleIds = [vehicleId];
    }

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
        utmTerm: data.utm?.utm_term,
        metadata: Object.keys(leadMetadata).length > 0
          ? (leadMetadata as Prisma.InputJsonValue)
          : undefined,
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

  async listDeals(accountId: string, search?: string, stage?: DealStage) {
    return this.prisma.deal.findMany({
      where: {
        accountId,
        stage: stage || undefined,
        OR: search
          ? [{ title: { contains: search, mode: "insensitive" } }]
          : undefined
      },
      include: {
        lead: true,
        vehicle: {
          include: {
            brand: true,
            model: true,
          },
        },
        dealItems: {
          include: {
            service: true,
          },
        },
        timeEntries: {
          select: {
            durationMinutes: true,
            startedAt: true,
            endedAt: true,
          },
        },
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
    revenue?: number;
    estimatedHours?: number;
    assignedResourceId?: string;
    failReason?: string;
    guaranteeUntil?: string;
    bookingScheduledAt?: string;
    serviceTimeBudgets?: Array<{ serviceId: string; plannedMinutes: number }>;
    vehicleData?: {
      brandId: string;
      modelId: string;
      year?: number;
      vin?: string;
      licensePlate?: string;
      color?: string;
      mileage?: number;
    };
    services?: Array<{ serviceId: string; quantity: number }>;
  }) {
    // Create or find vehicle if vehicleData provided
    let vehicleId: string | undefined;
    if (data.vehicleData) {
      const vd = data.vehicleData;
      let existingVehicle = null;
      if (vd.vin) {
        existingVehicle = await this.prisma.vehicle.findUnique({
          where: { accountId_vin: { accountId: data.accountId, vin: vd.vin } },
        });
      }
      if (!existingVehicle && vd.licensePlate) {
        existingVehicle = await this.prisma.vehicle.findUnique({
          where: { accountId_licensePlate: { accountId: data.accountId, licensePlate: vd.licensePlate } },
        });
      }
      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        const newVehicle = await this.prisma.vehicle.create({
          data: {
            accountId: data.accountId,
            brandId: vd.brandId,
            modelId: vd.modelId,
            year: vd.year,
            vin: vd.vin || null,
            licensePlate: vd.licensePlate || null,
            color: vd.color || null,
            mileage: vd.mileage,
          },
        });
        vehicleId = newVehicle.id;
      }
    }

    const stage = data.stage ?? DealStage.diagnostics;
    const metadata = this.normalizeDealMetadata(null);
    if (data.guaranteeUntil) {
      metadata.guaranteeUntil = data.guaranteeUntil;
    }
    if (data.serviceTimeBudgets && data.serviceTimeBudgets.length > 0) {
      metadata.serviceTimeBudgets = data.serviceTimeBudgets;
    }
    this.validateCancelledReason(stage, metadata, data.failReason);
    this.validateGuaranteeBeforeSuccess(stage, metadata);

    const deal = await this.prisma.deal.create({
      data: {
        account: { connect: { id: data.accountId } },
        lead: { connect: { id: data.leadId } },
        title: data.title,
        stage,
        amount: data.amount,
        revenue: data.revenue,
        estimatedHours: data.estimatedHours,
        metadata: Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonValue) : undefined,
        ...(data.assignedResourceId ? { assignedResource: { connect: { id: data.assignedResourceId } } } : {}),
        ...(vehicleId ? { vehicle: { connect: { id: vehicleId } } } : {}),
      }
    });

    // Create DealItems for selected services
    if (data.services && data.services.length > 0) {
      const serviceIds = data.services.map(s => s.serviceId);
      const services = await this.prisma.service.findMany({
        where: { id: { in: serviceIds } },
      });
      const serviceMap = new Map(services.map(s => [s.id, s]));

      await this.prisma.dealItem.createMany({
        data: data.services.map(item => ({
          dealId: deal.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: serviceMap.get(item.serviceId)?.price ?? 0,
        })),
      });
    }

    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: data.accountId } },
        action: "create",
        entity: "Deal",
        entityId: deal.id,
        meta: { amount: deal.amount }
      }
    });

    const bookingStatus = stage === DealStage.cancelled
      ? 'CANCELLED'
      : stage === DealStage.closed
      ? 'COMPLETED'
      : 'PLANNED';

    const specialist = data.assignedResourceId
      ? await this.prisma.resource.findUnique({
          where: { id: data.assignedResourceId },
          select: { name: true },
        })
      : null;

    await this.prisma.booking.create({
      data: {
        account: { connect: { id: data.accountId } },
        lead: { connect: { id: data.leadId } },
        specialist: specialist?.name || 'Не назначен',
        scheduledAt: data.bookingScheduledAt ? new Date(data.bookingScheduledAt) : new Date(),
        status: bookingStatus,
        metadata: {
          dealId: deal.id,
          autoCreated: true,
        },
        ...(data.assignedResourceId
          ? { resource: { connect: { id: data.assignedResourceId } } }
          : {}),
      },
    });

    return deal;
  }

  async listBookings(accountId: string) {
    return this.prisma.booking.findMany({
      where: { accountId },
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

  async listCampaigns(accountId: string) {
    return this.prisma.campaign.findMany({
      where: { accountId },
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

  async analyticsSummary(accountId: string) {
    const leads = await this.prisma.lead.count({ where: { accountId } });
    const deals = await this.prisma.deal.findMany({ where: { accountId } });
    const revenueStages: DealStage[] = [DealStage.in_progress, DealStage.ready, DealStage.closed];
    const revenue = deals.reduce((sum, deal) => {
      if (!revenueStages.includes(deal.stage)) return sum;
      return sum + (deal.revenue ?? deal.amount);
    }, 0);
    const avgCheck = deals.length ? Math.round(revenue / deals.length) : 0;
    const plan = await this.prisma.salesPlan.findFirst({
      where: { accountId },
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

  async utmReport(accountId: string) {
    const grouped = await this.prisma.lead.groupBy({
      by: ["utmSource", "utmMedium"],
      where: { accountId },
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
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        deals: {
          include: {
            vehicle: {
              include: {
                brand: true,
                model: true,
              },
            },
          },
        },
        bookings: true
      }
    });

    if (!lead) {
      return null;
    }

    const metadata = this.normalizeLeadMetadata(lead.metadata);
    const metadataVehicleIds = this.extractVehicleIdsFromLeadMetadata(metadata);
    const dealVehicleIds = lead.deals
      .map((deal) => deal.vehicleId)
      .filter((vehicleId): vehicleId is string => Boolean(vehicleId));
    const uniqueVehicleIds = Array.from(new Set([...metadataVehicleIds, ...dealVehicleIds]));

    const vehicles = uniqueVehicleIds.length > 0
      ? await this.prisma.vehicle.findMany({
          where: { id: { in: uniqueVehicleIds } },
          include: {
            brand: true,
            model: true,
          },
          orderBy: { updatedAt: 'desc' },
        })
      : [];

    return {
      ...lead,
      vehicles,
    };
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
      vehicleData?: {
        brandId: string;
        modelId: string;
        year?: number;
        vin?: string;
        licensePlate?: string;
        color?: string;
        mileage?: number;
      };
    }
  ) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
      select: {
        accountId: true,
        metadata: true,
      },
    });
    if (!existingLead) {
      throw new BadRequestException('Лид не найден');
    }

    const leadMetadata = this.normalizeLeadMetadata(existingLead.metadata);
    if (data.vehicleData?.brandId && data.vehicleData?.modelId) {
      const vehicleId = await this.resolveOrCreateVehicle(existingLead.accountId, data.vehicleData);
      const vehicleIds = this.extractVehicleIdsFromLeadMetadata(leadMetadata);
      if (!vehicleIds.includes(vehicleId)) {
        leadMetadata.vehicleIds = [...vehicleIds, vehicleId];
      }
    }

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
        utmTerm: data.utm?.utm_term,
        metadata: Object.keys(leadMetadata).length > 0
          ? (leadMetadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
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
      estimatedHours?: number;
      failReason?: string;
      guaranteeUntil?: string;
      serviceTimeBudgets?: Array<{ serviceId: string; plannedMinutes: number }>;
      vehicleData?: {
        brandId: string;
        modelId: string;
        year?: number;
        vin?: string;
        licensePlate?: string;
        color?: string;
        mileage?: number;
      };
      services?: Array<{ serviceId: string; quantity: number }>;
    }
  ) {
    const { vehicleData, services, failReason, guaranteeUntil, serviceTimeBudgets, ...dealData } = data;

    const existing = await this.prisma.deal.findUnique({
      where: { id },
      select: {
        stage: true,
        metadata: true,
      },
    });
    if (!existing) {
      throw new BadRequestException('Заказ не найден');
    }

    const nextStage = dealData.stage ?? existing.stage;
    const metadata = this.normalizeDealMetadata(existing.metadata);
    if (guaranteeUntil !== undefined) {
      if (guaranteeUntil) {
        metadata.guaranteeUntil = guaranteeUntil;
      } else {
        delete metadata.guaranteeUntil;
      }
    }
    if (serviceTimeBudgets !== undefined) {
      if (serviceTimeBudgets.length > 0) {
        metadata.serviceTimeBudgets = serviceTimeBudgets;
      } else {
        delete metadata.serviceTimeBudgets;
      }
    }
    this.validateCancelledReason(nextStage, metadata, failReason);
    this.validateGuaranteeBeforeSuccess(nextStage, metadata);

    const deal = await this.prisma.deal.update({
      where: { id },
      data: {
        ...dealData,
        metadata: Object.keys(metadata).length > 0
          ? (metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      }
    });
    await this.prisma.auditLog.create({
      data: {
        account: { connect: { id: deal.accountId } },
        action: "update",
        entity: "Deal",
        entityId: deal.id,
        meta: { changes: dealData }
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

  async updateDealStage(id: string, stage: DealStage, failReason?: string) {
    const existing = await this.prisma.deal.findUnique({
      where: { id },
      select: {
        metadata: true,
      },
    });
    if (!existing) {
      throw new BadRequestException('Заказ не найден');
    }

    const metadata = this.normalizeDealMetadata(existing.metadata);
    this.validateCancelledReason(stage, metadata, failReason);
    this.validateGuaranteeBeforeSuccess(stage, metadata);

    return this.prisma.deal.update({
      where: { id },
      data: {
        stage,
        metadata: Object.keys(metadata).length > 0
          ? (metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      }
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
