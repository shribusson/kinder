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

// Mock Telegraf
jest.mock('telegraf', () => ({
  Telegraf: jest.fn().mockImplementation(() => ({
    telegram: {
      setWebhook: jest.fn().mockResolvedValue(true),
      sendMessage: jest.fn().mockResolvedValue({ message_id: 12345 }),
      sendPhoto: jest.fn().mockResolvedValue({ message_id: 12346 }),
      sendVideo: jest.fn().mockResolvedValue({ message_id: 12347 }),
      sendDocument: jest.fn().mockResolvedValue({ message_id: 12348 }),
      sendAudio: jest.fn().mockResolvedValue({ message_id: 12349 }),
      getFile: jest.fn().mockResolvedValue({ file_path: 'photos/test.jpg' }),
    },
    command: jest.fn(),
    on: jest.fn(),
    launch: jest.fn(),
    handleUpdate: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { InteractionChannel, IntegrationStatus, MessageDirection, MessageStatus, ConversationStatus } from '@prisma/client';
import { Telegraf } from 'telegraf';

const QUEUE_OUTBOUND = 'outbound-messages';

describe('TelegramService', () => {
  let service: TelegramService;
  let prismaService: any;
  let storageService: any;
  let outboundQueue: any;

  const mockIntegration = {
    id: 'integration-123',
    accountId: 'account-123',
    channel: InteractionChannel.telegram,
    status: IntegrationStatus.active,
    settings: {
      botToken: 'test-bot-token',
      useWebhook: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConversation = {
    id: 'conv-123',
    accountId: 'account-123',
    channel: InteractionChannel.telegram,
    status: ConversationStatus.open,
    metadata: { chatId: '123456789' },
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'msg-123',
    accountId: 'account-123',
    conversationId: 'conv-123',
    direction: MessageDirection.outbound,
    content: 'Test message',
    status: MessageStatus.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      integration: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      message: {
        create: jest.fn(),
        update: jest.fn(),
      },
      lead: {
        findMany: jest.fn(),
      },
      mediaFile: {
        create: jest.fn(),
      },
    };

    storageService = {
      upload: jest.fn().mockResolvedValue({ url: 'https://storage.example.com/file.jpg', key: 'test-key' }),
      generateKey: jest.fn().mockReturnValue('accounts/123/telegram-media/test.jpg'),
    };

    outboundQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        { provide: PrismaService, useValue: prismaService },
        { provide: StorageService, useValue: storageService },
        { provide: getQueueToken(QUEUE_OUTBOUND), useValue: outboundQueue },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize bots for active integrations', async () => {
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);

      await service.onModuleInit();

      expect(prismaService.integration.findMany).toHaveBeenCalledWith({
        where: {
          channel: InteractionChannel.telegram,
          status: IntegrationStatus.active,
        },
      });
    });

    it('should handle empty integrations list', async () => {
      prismaService.integration.findMany.mockResolvedValue([]);

      await service.onModuleInit();

      expect(Telegraf).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should queue text message for sending', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      const result = await service.sendMessage('integration-123', '123456789', {
        text: 'Hello from test!',
      });

      expect(result).toHaveProperty('messageId');
      expect(prismaService.message.create).toHaveBeenCalled();
      expect(outboundQueue.add).toHaveBeenCalledWith('send-telegram', expect.objectContaining({
        messageId: 'msg-123',
        integrationId: 'integration-123',
        chatId: '123456789',
        text: 'Hello from test!',
      }));
    });

    it('should create new conversation if not exists', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(null);
      prismaService.conversation.create.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      await service.sendMessage('integration-123', '999888777', {
        text: 'New conversation',
      });

      expect(prismaService.conversation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          channel: InteractionChannel.telegram,
          metadata: { chatId: '999888777' },
        }),
      });
    });

    it('should throw error when integration not found', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('invalid-integration', '123456789', { text: 'Test' }),
      ).rejects.toThrow('Telegram integration invalid-integration not found');
    });

    it('should queue message with photo', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      await service.sendMessage('integration-123', '123456789', {
        text: 'Photo caption',
        photo: 'https://example.com/photo.jpg',
      });

      expect(outboundQueue.add).toHaveBeenCalledWith('send-telegram', expect.objectContaining({
        photo: 'https://example.com/photo.jpg',
        text: 'Photo caption',
      }));
    });
  });

  describe('sendMessageNow', () => {
    beforeEach(async () => {
      // Initialize a bot first
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      await service.onModuleInit();
    });

    it('should send text message via Telegram API', async () => {
      prismaService.message.update.mockResolvedValue(mockMessage);

      await service.sendMessageNow('integration-123', 'msg-123', '123456789', {
        text: 'Test message',
      });

      expect(prismaService.message.update).toHaveBeenCalledWith({
        where: { id: 'msg-123' },
        data: expect.objectContaining({
          externalId: '12345',
          status: MessageStatus.sent,
        }),
      });
    });

    it('should throw error when bot not found', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessageNow('nonexistent-bot', 'msg-123', '123456789', { text: 'Test' }),
      ).rejects.toThrow('Bot nonexistent-bot not found');
    });
  });

  describe('processWebhook', () => {
    beforeEach(async () => {
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      await service.onModuleInit();
    });

    it('should process webhook update', async () => {
      const update = {
        update_id: 123,
        message: {
          message_id: 456,
          from: { id: 789, first_name: 'Test' },
          chat: { id: 123456789 },
          text: 'Hello',
        },
      };

      await service.processWebhook('integration-123', update);

      const bot = service.getBot('integration-123');
      expect(bot?.handleUpdate).toHaveBeenCalledWith(update);
    });

    it('should throw error when bot not found for webhook', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null);

      await expect(
        service.processWebhook('nonexistent', {}),
      ).rejects.toThrow('Bot nonexistent not found');
    });
  });

  describe('notifyManagers', () => {
    beforeEach(async () => {
      process.env.TELEGRAM_MANAGER_CHAT_ID = '-1001234567890';
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);
      prismaService.integration.findUnique.mockResolvedValue({
        ...mockIntegration,
        settings: {
          ...mockIntegration.settings,
          managerGroupId: '-1001234567890',
        },
      });
      await service.onModuleInit();
    });

    afterEach(() => {
      delete process.env.TELEGRAM_MANAGER_CHAT_ID;
    });

    it('should send notification to manager group', async () => {
      await service.notifyManagers('integration-123', 'New lead received!');

      const bot = service.getBot('integration-123');
      expect(bot?.telegram.sendMessage).toHaveBeenCalledWith(
        '-1001234567890',
        'New lead received!',
        expect.any(Object),
      );
    });

    it('should handle missing manager group configuration', async () => {
      prismaService.integration.findUnique.mockResolvedValue({
        ...mockIntegration,
        settings: {
          botToken: 'test-token',
          // No managerGroupId
        },
      });
      delete process.env.TELEGRAM_MANAGER_CHAT_ID;

      // Should not throw, just log warning
      await service.notifyManagers('integration-123', 'Test');
    });

    it('should handle missing integration', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null);

      // Should not throw, just log warning
      await service.notifyManagers('nonexistent', 'Test');
    });
  });

  describe('getBot', () => {
    it('should return bot instance for valid integration', async () => {
      prismaService.integration.findMany.mockResolvedValue([mockIntegration]);
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      await service.onModuleInit();

      const bot = service.getBot('integration-123');

      expect(bot).toBeDefined();
    });

    it('should return undefined for non-existent integration', () => {
      const bot = service.getBot('nonexistent');

      expect(bot).toBeUndefined();
    });
  });
});
