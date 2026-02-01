// Mock queue module before any imports to avoid circular dependencies
jest.mock('../queue/queue.module', () => ({
  QUEUE_NAMES: {
    WEBHOOKS: 'webhooks',
    OUTBOUND_MESSAGES: 'outbound-messages',
    CALLS: 'calls',
    MEDIA_PROCESSING: 'media-processing',
    ANALYTICS: 'analytics',
    NOTIFICATIONS: 'notifications',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma.service';
import { LeadStage, DealStage } from '@prisma/client';

// Define queue name locally for provider registration
const QUEUE_WEBHOOKS = 'webhooks';

describe('CrmService', () => {
  let service: CrmService;
  let prismaService: any;
  let webhooksQueue: any;

  const mockLead = {
    id: 'lead-123',
    accountId: 'account-123',
    name: 'Test Lead',
    phone: '+77001234567',
    email: 'lead@test.com',
    source: 'website',
    stage: LeadStage.new,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeal = {
    id: 'deal-123',
    accountId: 'account-123',
    leadId: 'lead-123',
    title: 'Test Deal',
    stage: DealStage.new,
    amount: 50000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBooking = {
    id: 'booking-123',
    accountId: 'account-123',
    leadId: 'lead-123',
    specialist: 'Dr. Test',
    scheduledAt: new Date(),
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      lead: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      deal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      booking: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      campaign: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    webhooksQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        { provide: PrismaService, useValue: prismaService },
        { provide: getQueueToken(QUEUE_WEBHOOKS), useValue: webhooksQueue },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Leads', () => {
    describe('listLeads', () => {
      it('should return all leads', async () => {
        prismaService.lead.findMany.mockResolvedValue([mockLead]);

        const result = await service.listLeads();

        expect(result).toEqual([mockLead]);
        expect(prismaService.lead.findMany).toHaveBeenCalled();
      });

      it('should filter leads by search query', async () => {
        prismaService.lead.findMany.mockResolvedValue([mockLead]);

        await service.listLeads('test');

        const findManyCall = prismaService.lead.findMany.mock.calls[0][0];
        expect(findManyCall.where.OR).toBeDefined();
      });

      it('should filter leads by source', async () => {
        prismaService.lead.findMany.mockResolvedValue([]);

        await service.listLeads(undefined, 'website');

        const findManyCall = prismaService.lead.findMany.mock.calls[0][0];
        expect(findManyCall.where.source).toBe('website');
      });

      it('should filter leads by stage', async () => {
        prismaService.lead.findMany.mockResolvedValue([]);

        await service.listLeads(undefined, undefined, LeadStage.qualified);

        const findManyCall = prismaService.lead.findMany.mock.calls[0][0];
        expect(findManyCall.where.stage).toBe(LeadStage.qualified);
      });
    });

    describe('createLead', () => {
      it('should create a new lead', async () => {
        prismaService.lead.create.mockResolvedValue(mockLead);
        prismaService.auditLog.create.mockResolvedValue({});

        const result = await service.createLead({
          accountId: 'account-123',
          name: 'Test Lead',
          phone: '+77001234567',
          email: 'lead@test.com',
          source: 'website',
        });

        expect(result).toEqual(mockLead);
        expect(prismaService.lead.create).toHaveBeenCalled();
        expect(prismaService.auditLog.create).toHaveBeenCalled();
      });

      it('should use default stage "new" when not provided', async () => {
        prismaService.lead.create.mockResolvedValue(mockLead);
        prismaService.auditLog.create.mockResolvedValue({});

        await service.createLead({
          accountId: 'account-123',
          name: 'Test Lead',
          source: 'website',
        });

        const createCall = prismaService.lead.create.mock.calls[0][0];
        expect(createCall.data.stage).toBe(LeadStage.new);
      });
    });
  });

  describe('Deals', () => {
    describe('listDeals', () => {
      it('should return all deals', async () => {
        prismaService.deal.findMany.mockResolvedValue([mockDeal]);

        const result = await service.listDeals();

        expect(result).toEqual([mockDeal]);
      });

      it('should filter deals by search query', async () => {
        prismaService.deal.findMany.mockResolvedValue([]);

        await service.listDeals('test');

        const findManyCall = prismaService.deal.findMany.mock.calls[0][0];
        expect(findManyCall.where.OR).toBeDefined();
      });

      it('should filter deals by stage', async () => {
        prismaService.deal.findMany.mockResolvedValue([]);

        await service.listDeals(undefined, DealStage.won);

        const findManyCall = prismaService.deal.findMany.mock.calls[0][0];
        expect(findManyCall.where.stage).toBe(DealStage.won);
      });
    });

    describe('createDeal', () => {
      it('should create a new deal', async () => {
        prismaService.deal.create.mockResolvedValue(mockDeal);
        prismaService.auditLog.create.mockResolvedValue({});

        const result = await service.createDeal({
          accountId: 'account-123',
          leadId: 'lead-123',
          title: 'Test Deal',
          amount: 50000,
        });

        expect(result).toEqual(mockDeal);
        expect(prismaService.deal.create).toHaveBeenCalled();
        expect(prismaService.auditLog.create).toHaveBeenCalled();
      });

      it('should use default stage "new" when not provided', async () => {
        prismaService.deal.create.mockResolvedValue(mockDeal);
        prismaService.auditLog.create.mockResolvedValue({});

        await service.createDeal({
          accountId: 'account-123',
          leadId: 'lead-123',
          title: 'Test Deal',
          amount: 50000,
        });

        const createCall = prismaService.deal.create.mock.calls[0][0];
        expect(createCall.data.stage).toBe(DealStage.new);
      });
    });
  });

  describe('Bookings', () => {
    describe('listBookings', () => {
      it('should return all bookings ordered by scheduledAt', async () => {
        prismaService.booking.findMany.mockResolvedValue([mockBooking]);

        const result = await service.listBookings();

        expect(result).toEqual([mockBooking]);
        expect(prismaService.booking.findMany).toHaveBeenCalledWith({
          orderBy: { scheduledAt: 'asc' },
        });
      });
    });

    describe('createBooking', () => {
      it('should create a new booking', async () => {
        prismaService.booking.create.mockResolvedValue(mockBooking);
        prismaService.auditLog.create.mockResolvedValue({});

        const result = await service.createBooking({
          accountId: 'account-123',
          leadId: 'lead-123',
          specialist: 'Dr. Test',
          scheduledAt: '2024-01-15T10:00:00Z',
          status: 'scheduled',
        });

        expect(result).toEqual(mockBooking);
        expect(prismaService.booking.create).toHaveBeenCalled();
        expect(prismaService.auditLog.create).toHaveBeenCalled();
      });
    });
  });

  describe('Campaigns', () => {
    describe('listCampaigns', () => {
      it('should return all campaigns ordered by createdAt', async () => {
        const mockCampaign = { id: 'camp-123', name: 'Test Campaign' };
        prismaService.campaign.findMany.mockResolvedValue([mockCampaign]);

        const result = await service.listCampaigns();

        expect(result).toEqual([mockCampaign]);
        expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' },
        });
      });
    });
  });
});
