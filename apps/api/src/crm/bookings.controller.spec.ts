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
import { BookingsController } from './bookings.controller';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma.service';

describe('BookingsController', () => {
  let controller: BookingsController;
  let crmService: any;
  let prismaService: any;

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

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    accountId: 'account-123',
  };

  const mockReq = { user: { sub: 'user-123' } } as any;

  beforeEach(async () => {
    crmService = {
      listBookings: jest.fn().mockResolvedValue([mockBooking]),
      createBooking: jest.fn().mockResolvedValue(mockBooking),
    };

    prismaService = {
      membership: {
        findFirst: jest.fn().mockResolvedValue(mockMembership),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: CrmService, useValue: crmService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of bookings', async () => {
      const result = await controller.list(mockReq);

      expect(result).toEqual([mockBooking]);
      expect(crmService.listBookings).toHaveBeenCalledWith('account-123');
    });
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const req = { user: { sub: 'user-123' } };
      const payload = {
        leadId: 'lead-123',
        specialist: 'Dr. Test',
        scheduledAt: '2024-01-15T10:00:00Z',
        status: 'scheduled',
      };

      const result = await controller.create(payload, req as any);

      expect(result).toEqual(mockBooking);
      expect(crmService.createBooking).toHaveBeenCalledWith({
        ...payload,
        accountId: 'account-123',
      });
    });

    it('should throw error when no membership found', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } };
      const payload = {
        leadId: 'lead-123',
        specialist: 'Dr. Test',
        scheduledAt: '2024-01-15T10:00:00Z',
        status: 'scheduled',
      };

      await expect(controller.create(payload, req as any)).rejects.toThrow('No account');
    });
  });
});
