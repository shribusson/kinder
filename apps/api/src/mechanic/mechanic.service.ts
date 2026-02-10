import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class MechanicService {
  constructor(private prisma: PrismaService) {}

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
      },
    });
    if (!deal) throw new NotFoundException('Deal not found or not assigned to you');

    const totalMinutes = deal.timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    return { ...deal, totalHoursSpent: Math.round((totalMinutes / 60) * 10) / 10 };
  }
}
