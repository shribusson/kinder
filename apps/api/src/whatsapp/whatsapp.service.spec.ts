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
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { InteractionChannel, MessageStatus, MessageDirection, ConversationStatus } from '@prisma/client';

const QUEUE_OUTBOUND = 'outbound-messages';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let prismaService: any;
  let storageService: any;
  let outboundQueue: any;

  const mockIntegration = {
    id: 'integration-123',
    accountId: 'account-123',
    channel: InteractionChannel.whatsapp,
    status: 'active',
    settings: {
      accessToken: 'test-access-token',
      phoneNumberId: 'test-phone-id',
      businessAccountId: 'test-business-id',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConversation = {
    id: 'conv-123',
    accountId: 'account-123',
    channel: InteractionChannel.whatsapp,
    status: ConversationStatus.open,
    metadata: { phone: '+77001234567' },
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
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      message: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      mediaFile: {
        create: jest.fn(),
      },
    };

    storageService = {
      upload: jest.fn().mockResolvedValue({ url: 'https://storage.example.com/file.jpg', key: 'test-key' }),
      generateKey: jest.fn().mockReturnValue('accounts/123/whatsapp-media/test.jpg'),
    };

    outboundQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: PrismaService, useValue: prismaService },
        { provide: StorageService, useValue: storageService },
        { provide: getQueueToken(QUEUE_OUTBOUND), useValue: outboundQueue },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should queue text message for sending', async () => {
      prismaService.integration.findFirst.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      const result = await service.sendMessage({
        accountId: 'account-123',
        to: '+77001234567',
        type: 'text',
        content: 'Hello!',
        conversationId: 'conv-123',
      });

      expect(result).toHaveProperty('messageId');
      expect(prismaService.message.create).toHaveBeenCalled();
      expect(outboundQueue.add).toHaveBeenCalledWith('send-whatsapp', expect.objectContaining({
        messageId: 'msg-123',
        integrationId: 'integration-123',
        to: '+77001234567',
        type: 'text',
        content: 'Hello!',
      }));
    });

    it('should create new conversation if not provided', async () => {
      prismaService.integration.findFirst.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(null);
      prismaService.conversation.create.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      await service.sendMessage({
        accountId: 'account-123',
        to: '+77009999999',
        type: 'text',
        content: 'New conversation',
      });

      expect(prismaService.conversation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          channel: InteractionChannel.whatsapp,
          metadata: { phone: '+77009999999' },
        }),
      });
    });

    it('should throw error when no active integration found', async () => {
      prismaService.integration.findFirst.mockResolvedValue(null);

      await expect(
        service.sendMessage({
          accountId: 'account-123',
          to: '+77001234567',
          type: 'text',
          content: 'Test',
        }),
      ).rejects.toThrow('No active WhatsApp integration for account');
    });
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const payload = '{"test":"data"}';
      const secret = 'test-secret';
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      const expectedSignature = `sha256=${hmac.digest('hex')}`;

      const result = service.verifySignature(payload, expectedSignature, secret);

      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const payload = '{"test":"data"}';
      const secret = 'test-secret';
      const invalidSignature = 'sha256=invalid_signature_here';

      const result = service.verifySignature(payload, invalidSignature, secret);

      expect(result).toBe(false);
    });
  });

  describe('processWebhook', () => {
    it('should process incoming message webhook', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.conversation.findFirst.mockResolvedValue(null);
      prismaService.conversation.create.mockResolvedValue(mockConversation);
      prismaService.message.create.mockResolvedValue(mockMessage);

      const webhookPayload = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+77001234567',
                id: 'wamid.123',
                timestamp: '1234567890',
                type: 'text',
                text: { body: 'Hello from WhatsApp' },
              }],
              contacts: [{ profile: { name: 'Test User' } }],
            },
          }],
        }],
      };

      await service.processWebhook('integration-123', webhookPayload);

      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          direction: MessageDirection.inbound,
          content: 'Hello from WhatsApp',
        }),
      });
    });

    it('should handle status update webhook', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.message.updateMany.mockResolvedValue({ count: 1 });

      const webhookPayload = {
        entry: [{
          changes: [{
            value: {
              statuses: [{
                id: 'wamid.123',
                status: 'delivered',
                timestamp: '1234567890',
              }],
            },
          }],
        }],
      };

      await service.processWebhook('integration-123', webhookPayload);

      expect(prismaService.message.updateMany).toHaveBeenCalledWith({
        where: { externalId: 'wamid.123' },
        data: expect.objectContaining({
          status: MessageStatus.delivered,
        }),
      });
    });

    it('should throw error when integration not found', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null);

      await expect(
        service.processWebhook('invalid-integration', {}),
      ).rejects.toThrow('Integration invalid-integration not found');
    });

    it('should handle invalid webhook payload gracefully', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);

      // Should not throw, just log warning
      await service.processWebhook('integration-123', {});

      expect(prismaService.message.create).not.toHaveBeenCalled();
    });
  });

  describe('sendMessageNow', () => {
    beforeEach(() => {
      // Mock global fetch
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should send text message via WhatsApp API', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.message.update.mockResolvedValue(mockMessage);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          messages: [{ id: 'wamid.sent123' }],
        }),
      });

      await service.sendMessageNow(
        'integration-123',
        'msg-123',
        '+77001234567',
        'text',
        'Test message',
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      expect(prismaService.message.update).toHaveBeenCalledWith({
        where: { id: 'msg-123' },
        data: expect.objectContaining({
          externalId: 'wamid.sent123',
          status: MessageStatus.sent,
        }),
      });
    });

    it('should handle API error and mark message as failed', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.message.update.mockResolvedValue(mockMessage);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('API Error: Invalid token'),
      });

      await expect(
        service.sendMessageNow('integration-123', 'msg-123', '+77001234567', 'text', 'Test'),
      ).rejects.toThrow('WhatsApp API error');

      expect(prismaService.message.update).toHaveBeenCalledWith({
        where: { id: 'msg-123' },
        data: { status: MessageStatus.failed },
      });
    });

    it('should send image message correctly', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.message.update.mockResolvedValue(mockMessage);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          messages: [{ id: 'wamid.img123' }],
        }),
      });

      await service.sendMessageNow(
        'integration-123',
        'msg-123',
        '+77001234567',
        'image',
        { url: 'https://example.com/image.jpg', caption: 'Photo' },
      );

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.type).toBe('image');
      expect(body.image.link).toBe('https://example.com/image.jpg');
    });

    it('should throw error for unsupported message type', async () => {
      prismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      prismaService.message.update.mockResolvedValue(mockMessage);

      await expect(
        service.sendMessageNow('integration-123', 'msg-123', '+77001234567', 'unsupported', {}),
      ).rejects.toThrow('Unsupported message type');
    });
  });
});
