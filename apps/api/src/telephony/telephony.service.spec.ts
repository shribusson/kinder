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

// Mock ari-client
const mockAriClient = {
  start: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  recordings: {
    getStored: jest.fn().mockResolvedValue({
      duration: 120,
      delete: jest.fn().mockResolvedValue(undefined),
    }),
  },
};

jest.mock('ari-client', () => ({
  connect: jest.fn((url: string, username: string, password: string, callback: Function) => {
    callback(null, mockAriClient);
  }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { TelephonyService } from './telephony.service';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';

const QUEUE_CALLS = 'calls';

describe('TelephonyService', () => {
  let service: TelephonyService;
  let prismaService: any;
  let storageService: any;
  let callsQueue: any;

  const mockCall = {
    id: 'call-123',
    accountId: 'account-123',
    phoneNumber: '+77001234567',
    direction: 'inbound',
    status: 'ringing',
    duration: 0,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: { externalId: 'channel-123' },
  };

  const mockRecording = {
    id: 'recording-123',
    callId: 'call-123',
    url: 'https://storage.example.com/recordings/call-123.wav',
    duration: 120,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    // Reset environment variables
    process.env.ASTERISK_ARI_URL = 'http://localhost:8088';
    process.env.ASTERISK_ARI_USERNAME = 'asterisk';
    process.env.ASTERISK_ARI_PASSWORD = 'asterisk';

    prismaService = {
      call: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      callRecording: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      mediaFile: {
        create: jest.fn(),
      },
    };

    storageService = {
      upload: jest.fn().mockResolvedValue({ url: 'https://storage.example.com/recordings/test.wav', key: 'test-key' }),
      generateKey: jest.fn().mockReturnValue('accounts/123/recordings/call-123.wav'),
    };

    callsQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelephonyService,
        { provide: PrismaService, useValue: prismaService },
        { provide: StorageService, useValue: storageService },
        { provide: getQueueToken(QUEUE_CALLS), useValue: callsQueue },
      ],
    }).compile();

    service = module.get<TelephonyService>(TelephonyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to Asterisk ARI', async () => {
      await service.onModuleInit();

      expect(service.isConnected()).toBe(true);
    });

    it('should register event handlers', async () => {
      await service.onModuleInit();

      expect(mockAriClient.on).toHaveBeenCalledWith('StasisStart', expect.any(Function));
      expect(mockAriClient.on).toHaveBeenCalledWith('StasisEnd', expect.any(Function));
      expect(mockAriClient.on).toHaveBeenCalledWith('ChannelStateChange', expect.any(Function));
      expect(mockAriClient.on).toHaveBeenCalledWith('ChannelDtmfReceived', expect.any(Function));
    });
  });

  describe('initiateCall', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should create call and queue for initiation', async () => {
      prismaService.call.create.mockResolvedValue(mockCall);

      const result = await service.initiateCall({
        accountId: 'account-123',
        from: '+77001111111',
        to: '+77002222222',
      });

      expect(result).toHaveProperty('callId');
      expect(prismaService.call.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accountId: 'account-123',
          phoneNumber: '+77002222222',
          direction: 'outbound',
          status: 'initiated',
        }),
      });
      expect(callsQueue.add).toHaveBeenCalledWith('initiate-call', expect.objectContaining({
        callId: 'call-123',
        from: '+77001111111',
        to: '+77002222222',
      }));
    });

    it('should throw error when ARI not connected', async () => {
      // Create new service instance without connecting
      const disconnectedModule: TestingModule = await Test.createTestingModule({
        providers: [
          TelephonyService,
          { provide: PrismaService, useValue: prismaService },
          { provide: StorageService, useValue: storageService },
          { provide: getQueueToken(QUEUE_CALLS), useValue: callsQueue },
        ],
      }).compile();

      const disconnectedService = disconnectedModule.get<TelephonyService>(TelephonyService);

      await expect(
        disconnectedService.initiateCall({
          accountId: 'account-123',
          from: '+77001111111',
          to: '+77002222222',
        }),
      ).rejects.toThrow('ARI client not connected');
    });

    it('should include custom variables', async () => {
      prismaService.call.create.mockResolvedValue(mockCall);

      await service.initiateCall({
        accountId: 'account-123',
        from: '+77001111111',
        to: '+77002222222',
        variables: {
          CUSTOM_VAR: 'custom-value',
        },
      });

      expect(callsQueue.add).toHaveBeenCalledWith('initiate-call', expect.objectContaining({
        variables: expect.objectContaining({
          ACCOUNT_ID: 'account-123',
          CUSTOM_VAR: 'custom-value',
        }),
      }));
    });
  });

  describe('getCall', () => {
    it('should return call with recording and lead', async () => {
      const callWithRelations = {
        ...mockCall,
        recording: mockRecording,
        lead: { id: 'lead-123', name: 'Test Lead' },
      };
      prismaService.call.findFirst.mockResolvedValue(callWithRelations);

      const result = await service.getCall('call-123', 'account-123');

      expect(result).toEqual(callWithRelations);
      expect(prismaService.call.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'call-123',
          accountId: 'account-123',
        },
        include: {
          recording: true,
          lead: true,
        },
      });
    });

    it('should return null for non-existent call', async () => {
      prismaService.call.findFirst.mockResolvedValue(null);

      const result = await service.getCall('nonexistent', 'account-123');

      expect(result).toBeNull();
    });
  });

  describe('getRecordings', () => {
    it('should return recordings for a call', async () => {
      prismaService.callRecording.findMany.mockResolvedValue([mockRecording]);

      const result = await service.getRecordings('call-123', 'account-123');

      expect(result).toEqual([mockRecording]);
      expect(prismaService.callRecording.findMany).toHaveBeenCalledWith({
        where: {
          call: {
            id: 'call-123',
            accountId: 'account-123',
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no recordings', async () => {
      prismaService.callRecording.findMany.mockResolvedValue([]);

      const result = await service.getRecordings('call-123', 'account-123');

      expect(result).toEqual([]);
    });
  });

  describe('processRecording', () => {
    beforeEach(async () => {
      await service.onModuleInit();
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should download, upload, and create recording record', async () => {
      prismaService.call.findUnique.mockResolvedValue(mockCall);
      prismaService.mediaFile.create.mockResolvedValue({
        id: 'media-123',
        url: 'https://storage.example.com/recordings/call-123.wav',
      });
      prismaService.callRecording.create.mockResolvedValue(mockRecording);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
      });

      await service.processRecording('call-123', 'call-call-123');

      expect(storageService.upload).toHaveBeenCalledWith({
        key: expect.stringContaining('recordings'),
        body: expect.any(Buffer),
        contentType: 'audio/wav',
      });

      expect(prismaService.callRecording.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          callId: 'call-123',
          duration: 120,
        }),
      });
    });

    it('should throw error when call not found', async () => {
      prismaService.call.findUnique.mockResolvedValue(null);

      await expect(
        service.processRecording('nonexistent', 'recording-name'),
      ).rejects.toThrow('Call nonexistent not found');
    });

    it('should throw error when recording download fails', async () => {
      prismaService.call.findUnique.mockResolvedValue(mockCall);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        service.processRecording('call-123', 'nonexistent-recording'),
      ).rejects.toThrow('Failed to download recording');
    });
  });

  describe('getCallStats', () => {
    it('should calculate call statistics correctly', async () => {
      const calls = [
        { ...mockCall, direction: 'inbound', status: 'completed', duration: 120 },
        { ...mockCall, id: 'call-2', direction: 'inbound', status: 'completed', duration: 60 },
        { ...mockCall, id: 'call-3', direction: 'outbound', status: 'completed', duration: 90 },
        { ...mockCall, id: 'call-4', direction: 'outbound', status: 'failed', duration: 0 },
      ];
      prismaService.call.findMany.mockResolvedValue(calls);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await service.getCallStats('account-123', startDate, endDate);

      expect(result).toEqual({
        total: 4,
        inbound: 2,
        outbound: 2,
        completed: 3,
        failed: 1,
        avgDuration: 67.5, // (120 + 60 + 90 + 0) / 4
        totalDuration: 270,
      });
    });

    it('should handle empty call list', async () => {
      prismaService.call.findMany.mockResolvedValue([]);

      const result = await service.getCallStats(
        'account-123',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toEqual({
        total: 0,
        inbound: 0,
        outbound: 0,
        completed: 0,
        failed: 0,
        avgDuration: 0,
        totalDuration: 0,
      });
    });

    it('should filter by date range', async () => {
      prismaService.call.findMany.mockResolvedValue([]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await service.getCallStats('account-123', startDate, endDate);

      expect(prismaService.call.findMany).toHaveBeenCalledWith({
        where: {
          accountId: 'account-123',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    });
  });

  describe('isConnected', () => {
    it('should return true after successful connection', async () => {
      await service.onModuleInit();

      expect(service.isConnected()).toBe(true);
    });

    it('should return false before connection', () => {
      expect(service.isConnected()).toBe(false);
    });
  });
});
