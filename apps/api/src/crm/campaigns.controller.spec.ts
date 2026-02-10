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
import { CampaignsController } from './campaigns.controller';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma.service';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let crmService: any;
  let prismaService: any;

  const mockCampaign = {
    id: 'campaign-123',
    accountId: 'account-123',
    name: 'Test Campaign',
    channel: 'telegram',
    status: 'draft',
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
      listCampaigns: jest.fn().mockResolvedValue([mockCampaign]),
      createCampaign: jest.fn().mockResolvedValue(mockCampaign),
    };

    prismaService = {
      membership: {
        findFirst: jest.fn().mockResolvedValue(mockMembership),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        { provide: CrmService, useValue: crmService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of campaigns', async () => {
      const result = await controller.list(mockReq);

      expect(result).toEqual([mockCampaign]);
      expect(crmService.listCampaigns).toHaveBeenCalledWith('account-123');
    });
  });

  describe('create', () => {
    it('should create a new campaign', async () => {
      const req = { user: { sub: 'user-123' } };
      const payload = {
        name: 'New Campaign',
        source: 'telegram',
        spend: 10000,
        leads: 50,
      };

      const result = await controller.create(payload, req as any);

      expect(result).toEqual(mockCampaign);
      expect(crmService.createCampaign).toHaveBeenCalledWith({
        ...payload,
        accountId: 'account-123',
      });
    });

    it('should throw error when no membership found', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } };
      const payload = {
        name: 'New Campaign',
        source: 'website',
        spend: 5000,
        leads: 20,
      };

      await expect(controller.create(payload, req as any)).rejects.toThrow('No account');
    });
  });
});
