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
import { DealsController } from './deals.controller';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma.service';
import { DealStage } from '@prisma/client';

describe('DealsController', () => {
  let controller: DealsController;
  let crmService: any;
  let prismaService: any;

  const mockDeal = {
    id: 'deal-123',
    accountId: 'account-123',
    leadId: 'lead-123',
    title: 'Test Deal',
    stage: DealStage.diagnostics,
    amount: 50000,
    revenue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    accountId: 'account-123',
  };

  const mockReq = { user: { sub: 'user-123' } } as any;

  beforeEach(async () => {
    crmService = {
      listDeals: jest.fn().mockResolvedValue([mockDeal]),
      createDeal: jest.fn().mockResolvedValue(mockDeal),
    };

    prismaService = {
      membership: {
        findFirst: jest.fn().mockResolvedValue(mockMembership),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        { provide: CrmService, useValue: crmService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<DealsController>(DealsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of deals', async () => {
      const result = await controller.list(mockReq);

      expect(result).toEqual([mockDeal]);
      expect(crmService.listDeals).toHaveBeenCalledWith('account-123', undefined, undefined);
    });

    it('should filter by search query', async () => {
      await controller.list(mockReq, 'test');

      expect(crmService.listDeals).toHaveBeenCalledWith('account-123', 'test', undefined);
    });

    it('should filter by stage', async () => {
      await controller.list(mockReq, undefined, 'won');

      expect(crmService.listDeals).toHaveBeenCalledWith('account-123', undefined, 'won');
    });
  });

  describe('export', () => {
    it('should export deals as CSV', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.export(mockReq, mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=deals.csv',
      );
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new deal', async () => {
      const payload = {
        leadId: 'lead-123',
        title: 'New Deal',
        amount: 75000,
      };

      const result = await controller.create(payload, mockReq);

      expect(result).toEqual(mockDeal);
      expect(crmService.createDeal).toHaveBeenCalledWith({
        ...payload,
        accountId: 'account-123',
      });
    });

    it('should throw error when no membership found', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const payload = {
        leadId: 'lead-123',
        title: 'New Deal',
        amount: 50000,
      };

      await expect(controller.create(payload, mockReq)).rejects.toThrow('No account');
    });
  });
});
