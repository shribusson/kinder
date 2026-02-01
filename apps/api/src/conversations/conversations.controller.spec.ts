import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma.service';
import { InteractionChannel } from '@prisma/client';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let conversationsService: any;
  let prismaService: any;

  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    accountId: 'account-123',
    role: 'manager',
  };

  const mockConversation = {
    id: 'conv-123',
    accountId: 'account-123',
    channel: InteractionChannel.telegram,
    status: 'open',
    lastMessageAt: new Date(),
    messages: [],
    lead: { id: 'lead-123', name: 'Test Lead' },
  };

  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    content: 'Test message',
    direction: 'outbound',
    status: 'sent',
  };

  const mockStats = {
    total: 10,
    unread: 3,
    byChannel: {
      telegram: 5,
      whatsapp: 3,
      telephony: 2,
    },
  };

  beforeEach(async () => {
    conversationsService = {
      getConversations: jest.fn().mockResolvedValue({
        conversations: [mockConversation],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      getConversation: jest.fn().mockResolvedValue(mockConversation),
      getStats: jest.fn().mockResolvedValue(mockStats),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      assignConversation: jest.fn().mockResolvedValue({ ...mockConversation, assignedToUserId: 'user-456' }),
      archiveConversation: jest.fn().mockResolvedValue({ ...mockConversation, status: 'archived' }),
      sendMessage: jest.fn().mockResolvedValue(mockMessage),
    };

    prismaService = {
      membership: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        { provide: ConversationsService, useValue: conversationsService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return paginated conversations', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.getConversations(req, 'account-123');

      expect(result.conversations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(conversationsService.getConversations).toHaveBeenCalledWith({
        accountId: 'account-123',
        channel: undefined,
        search: undefined,
        unreadOnly: false,
        assignedToUserId: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by channel', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      await controller.getConversations(
        req,
        'account-123',
        InteractionChannel.telegram,
      );

      expect(conversationsService.getConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: InteractionChannel.telegram,
        }),
      );
    });

    it('should filter by unreadOnly', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      await controller.getConversations(
        req,
        'account-123',
        undefined,
        undefined,
        'true',
      );

      expect(conversationsService.getConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          unreadOnly: true,
        }),
      );
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.getConversations(req, 'account-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return conversation stats', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.getStats('account-123', req);

      expect(result).toEqual(mockStats);
      expect(conversationsService.getStats).toHaveBeenCalledWith('account-123');
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.getStats('account-123', req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversation', () => {
    it('should return single conversation', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.getConversation('conv-123', 'account-123', req);

      expect(result).toEqual(mockConversation);
      expect(conversationsService.getConversation).toHaveBeenCalledWith('conv-123', 'account-123');
    });

    it('should throw NotFoundException when conversation not found', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);
      conversationsService.getConversation.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.getConversation('nonexistent', 'account-123', req),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.getConversation('conv-123', 'account-123', req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.markAsRead('conv-123', 'account-123', req);

      expect(result).toEqual({ success: true });
      expect(conversationsService.markAsRead).toHaveBeenCalledWith('conv-123', 'account-123');
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.markAsRead('conv-123', 'account-123', req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignConversation', () => {
    it('should assign conversation to user', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.assignConversation(
        'conv-123',
        'account-123',
        'user-456',
        req,
      );

      expect(result.assignedToUserId).toBe('user-456');
      expect(conversationsService.assignConversation).toHaveBeenCalledWith(
        'conv-123',
        'account-123',
        'user-456',
      );
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.assignConversation('conv-123', 'account-123', 'user-456', req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archiveConversation', () => {
    it('should archive conversation', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.archiveConversation('conv-123', 'account-123', req);

      expect(result.status).toBe('archived');
      expect(conversationsService.archiveConversation).toHaveBeenCalledWith('conv-123', 'account-123');
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.archiveConversation('conv-123', 'account-123', req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    it('should send message in conversation', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      const result = await controller.sendMessage(
        req,
        'conv-123',
        'account-123',
        'Hello!',
      );

      expect(result).toEqual(mockMessage);
      expect(conversationsService.sendMessage).toHaveBeenCalledWith(
        'conv-123',
        'account-123',
        {
          text: 'Hello!',
          mediaFileId: undefined,
          userId: 'user-123',
        },
      );
    });

    it('should send message with media attachment', async () => {
      prismaService.membership.findFirst.mockResolvedValue(mockMembership);

      const req = { user: { sub: 'user-123' } } as any;
      await controller.sendMessage(
        req,
        'conv-123',
        'account-123',
        'Check this out!',
        'media-123',
      );

      expect(conversationsService.sendMessage).toHaveBeenCalledWith(
        'conv-123',
        'account-123',
        expect.objectContaining({
          mediaFileId: 'media-123',
        }),
      );
    });

    it('should throw NotFoundException when user has no membership', async () => {
      prismaService.membership.findFirst.mockResolvedValue(null);

      const req = { user: { sub: 'user-123' } } as any;

      await expect(
        controller.sendMessage(req, 'conv-123', 'account-123', 'Test'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
