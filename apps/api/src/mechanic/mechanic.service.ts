import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MechanicService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getResourceIdForUser(user: any): Promise<string | null> {
    let accountId = user.accountId;
    if (!accountId) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: user.sub || user.id },
      });
      if (!membership) return null;
      accountId = membership.accountId;
    }

    // Try to find resource matching user's email
    if (user.email) {
      const resource = await this.prisma.resource.findFirst({
        where: {
          accountId,
          email: user.email,
          type: 'specialist',
          isActive: true,
        },
        select: { id: true },
      });
      if (resource) return resource.id;
    }

    // For admin/manager: fall back to first specialist in account
    const role = user.role;
    if (role === 'admin' || role === 'superadmin' || role === 'manager') {
      const firstSpecialist = await this.prisma.resource.findFirst({
        where: { accountId, type: 'specialist', isActive: true },
        select: { id: true },
      });
      return firstSpecialist?.id || null;
    }

    return null;
  }

  async getDashboard(resourceId: string, accountId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, accountId, type: 'specialist', isActive: true },
    });
    if (!resource) throw new NotFoundException('Mechanic resource not found');

    const assignedDeals = await this.prisma.deal.findMany({
      where: {
        accountId,
        assignedResourceId: resourceId,
        stage: { in: ['diagnostics', 'planned', 'in_progress'] },
      },
      include: {
        lead: true,
        vehicle: { include: { brand: true, model: true } },
        dealItems: { include: { service: true } },
        timeEntries: { where: { resourceId }, orderBy: { startedAt: 'desc' } },
        workLogs: {
          include: {
            media: { include: { mediaFile: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeTimer = await this.getActiveTimer(resourceId, accountId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTimeEntries = await this.prisma.timeEntry.findMany({
      where: { accountId, resourceId, startedAt: { gte: today, lt: tomorrow } },
    });

    const hoursWorked = todayTimeEntries.reduce((sum, entry) => {
      if (entry.durationMinutes) return sum + entry.durationMinutes / 60;
      if (!entry.endedAt) {
        const elapsed = Date.now() - new Date(entry.startedAt).getTime();
        return sum + elapsed / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    const dealsCompleted = await this.prisma.deal.count({
      where: {
        accountId,
        assignedResourceId: resourceId,
        stage: { in: ['ready', 'closed'] },
        updatedAt: { gte: today, lt: tomorrow },
      },
    });

    return {
      resource,
      assignedDeals,
      activeTimer,
      stats: {
        hoursWorked: Math.round(hoursWorked * 10) / 10,
        dealsCompleted,
        dealsInProgress: assignedDeals.filter((d) => d.stage === 'in_progress').length,
      },
    };
  }

  async startTimer(dealId: string, resourceId: string, accountId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, accountId, assignedResourceId: resourceId },
    });
    if (!deal) throw new NotFoundException('Deal not found or not assigned to this mechanic');

    const existingTimer = await this.prisma.timeEntry.findFirst({
      where: { accountId, resourceId, endedAt: null },
    });
    if (existingTimer) {
      throw new BadRequestException('You already have an active timer. Stop it first.');
    }

    return this.prisma.timeEntry.create({
      data: { accountId, dealId, resourceId, startedAt: new Date() },
      include: {
        deal: { include: { lead: true, vehicle: { include: { brand: true, model: true } } } },
      },
    });
  }

  async stopTimer(timeEntryId: string, resourceId: string, accountId: string, notes?: string) {
    const timeEntry = await this.prisma.timeEntry.findFirst({
      where: { id: timeEntryId, accountId, resourceId, endedAt: null },
    });
    if (!timeEntry) throw new NotFoundException('Active timer not found');

    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - new Date(timeEntry.startedAt).getTime()) / (1000 * 60));

    return this.prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: { endedAt, durationMinutes, notes: notes || timeEntry.notes },
      include: { deal: { include: { lead: true } } },
    });
  }

  async getActiveTimer(resourceId: string, accountId: string) {
    return this.prisma.timeEntry.findFirst({
      where: { accountId, resourceId, endedAt: null },
      include: {
        deal: { include: { lead: true, vehicle: { include: { brand: true, model: true } } } },
      },
    });
  }

  async getDealDetails(dealId: string, resourceId: string, accountId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, accountId, assignedResourceId: resourceId },
      include: {
        lead: true,
        vehicle: {
          include: {
            brand: true,
            model: true,
            serviceHistory: { orderBy: { serviceDate: 'desc' }, take: 10 },
          },
        },
        dealItems: { include: { service: { include: { category: true } } } },
        timeEntries: { where: { resourceId }, orderBy: { startedAt: 'desc' } },
        workLogs: {
          include: {
            resource: true,
            media: { include: { mediaFile: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found or not assigned to you');

    const totalMinutes = deal.timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    return { ...deal, totalHoursSpent: Math.round((totalMinutes / 60) * 10) / 10 };
  }

  async quickCreateDeal(accountId: string, resourceId: string, payload: any) {
    const lead = await this.prisma.lead.create({
      data: {
        accountId,
        name: payload.lead.name,
        phone: payload.lead.phone,
        email: payload.lead.email,
        source: 'mechanic',
      },
    });

    const deal = await this.prisma.deal.create({
      data: {
        accountId,
        leadId: lead.id,
        title: payload.title || 'Новый заказ',
        stage: payload.stage || 'diagnostics',
        amount: 0,
        estimatedHours: payload.estimatedHours,
        assignedResourceId: resourceId,
        metadata: payload.vehicle ? {
          licensePlate: payload.vehicle.licensePlate,
          vin: payload.vehicle.vin,
          brandId: payload.vehicle.brandId,
          modelId: payload.vehicle.modelId,
        } : undefined,
      },
      include: {
        lead: true,
        vehicle: { include: { brand: true, model: true } },
        dealItems: true,
        timeEntries: true,
        workLogs: true,
      },
    });

    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      select: { name: true },
    });

    await this.prisma.booking.create({
      data: {
        accountId,
        leadId: lead.id,
        specialist: resource?.name || 'Специалист',
        resourceId,
        scheduledAt: new Date(),
        status: 'PLANNED',
        metadata: {
          dealId: deal.id,
          autoCreated: true,
        },
      },
    });

    return deal;
  }

  private async ensureDealAccess(dealId: string, resourceId: string, accountId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId, accountId, assignedResourceId: resourceId },
      select: { id: true },
    });
    if (!deal) throw new NotFoundException('Deal not found or not assigned to this mechanic');
  }

  async createWorkLog(accountId: string, resourceId: string, dealId: string, dto: any) {
    await this.ensureDealAccess(dealId, resourceId, accountId);
    return this.prisma.workLog.create({
      data: {
        accountId,
        dealId,
        resourceId,
        title: dto.title,
        description: dto.description,
        status: dto.status || 'open',
        checklist: dto.checklist,
      },
      include: {
        media: { include: { mediaFile: true } },
      },
    });
  }

  async listWorkLogs(accountId: string, resourceId: string, dealId: string) {
    await this.ensureDealAccess(dealId, resourceId, accountId);
    return this.prisma.workLog.findMany({
      where: { accountId, dealId },
      include: {
        media: { include: { mediaFile: true } },
        resource: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateChecklist(accountId: string, resourceId: string, logId: string, checklist: any[]) {
    const log = await this.prisma.workLog.findFirst({
      where: { id: logId, accountId, resourceId },
    });
    if (!log) throw new NotFoundException('Work log not found');
    return this.prisma.workLog.update({
      where: { id: logId },
      data: { checklist },
      include: { media: { include: { mediaFile: true } } },
    });
  }

  async attachMedia(accountId: string, resourceId: string, logId: string, file: Express.Multer.File) {
    const log = await this.prisma.workLog.findFirst({
      where: { id: logId, accountId, resourceId },
    });
    if (!log) throw new NotFoundException('Work log not found');

    const key = this.storage.generateKey(accountId, 'mechanic-logs', file.originalname);
    const { url } = await this.storage.upload({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        uploadedBy: resourceId,
        logId,
      },
      acl: 'private',
    });

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        accountId,
        name: file.originalname,
        url,
        storageKey: key,
        mimeType: file.mimetype,
        fileSize: file.size,
        bucket: 'default',
      },
    });

    const link = await this.prisma.workLogMedia.create({
      data: {
        workLogId: logId,
        mediaFileId: mediaFile.id,
      },
      include: { mediaFile: true },
    });

    return link;
  }
}
