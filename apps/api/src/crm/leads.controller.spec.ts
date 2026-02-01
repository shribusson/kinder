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
import { LeadsController } from './leads.controller';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma.service';
import { LeadStage } from '@prisma/client';

describe('LeadsController', () => {
  let controller: LeadsController;
  let crmService: any;
  let prismaService: any;

  const mockLead = {
    id: 'lead-123',
    accountId: 'account-123',
    name: 'Test Lead',
    phone: '+77001234567',
    email: 'lead@example.com',
    source: 'website',
    stage: LeadStage.new,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    accountId: 'account-123',
  };

  beforeEach(async () => {
    crmService = {
      listLeads: jest.fn().mockResolvedValue([mockLead]),
      createLead: jest.fn().mockResolvedValue(mockLead),
    };

    prismaService = {
      membership: {
        findFirst: jest.fn().mockResolvedValue(mockMembership),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        { provide: CrmService, useValue: crmService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of leads', async () => {
      const result = await controller.list();

      expect(result).toEqual([mockLead]);
      expect(crmService.listLeads).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it('should filter by search query', async () => {
      await controller.list('test');

      expect(crmService.listLeads).toHaveBeenCalledWith('test', undefined, undefined);
    });

    it('should filter by source', async () => {
      await controller.list(undefined, 'website');

      expect(crmService.listLeads).toHaveBeenCalledWith(undefined, 'website', undefined);
    });

    it('should filter by stage', async () => {
      await controller.list(undefined, undefined, 'qualified');

      expect(crmService.listLeads).toHaveBeenCalledWith(undefined, undefined, 'qualified');
    });
  });

  describe('export', () => {
    it('should export leads as CSV', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.export(mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=leads.csv',
      );
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const req = { user: { sub: 'user-123' } };
      const payload = {
        name: 'New Lead',
        phone: '+77009876543',
        email: 'new@example.com',
        source: 'telegram',
      };

      const result = await controller.create(payload, req as any);

      expect(result).toEqual(mockLead);
      expect(crmService.createLead).toHaveBeenCalledWith({
        ...payload,
        accountId: 'account-123',
      });
    });

    it('should throw error when no membership found', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } };
      const payload = {
        name: 'New Lead',
        source: 'website',
      };

      await expect(controller.create(payload, req as any)).rejects.toThrow('No account found');
    });
  });
});
