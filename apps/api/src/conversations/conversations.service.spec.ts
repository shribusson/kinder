import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma.service';
import { InteractionChannel } from '@prisma/client';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: any;

  const mockAccount = {
    id: 'account-123',
    name: 'Test Account',
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockLead = {
    id: 'lead-123',
    name: 'Test Lead',
    phone: '+77001234567',
    email: 'lead@test.com',
  };

  const mockConversation = {
    id: 'conv-123',
    accountId: 'account-123',
    channel: 'telegram' as InteractionChannel,
    externalId: 'ext-123',
    status: 'open',
    lastMessageAt: new Date(),
    assignedToUserId: null,
    leadId: 'lead-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedTo: null,
    lead: mockLead,
    messages: [],
  };

  const mockMessage = {
    id: 'msg-123',
    accountId: 'account-123',
    conversationId: 'conv-123',
    direction: 'inbound',
    content: 'Hello!',
    status: 'delivered',
    mediaFileId: null,
    readAt: null,
    createdAt: new Date(),
    mediaFile: null,
  };

  beforeEach(async () => {
    prismaService = {
      conversation: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnreadCount', () => {
    it('should return count of unread inbound messages', async () => {
      prismaService.message.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('conv-123');

      expect(result).toBe(5);
      expect(prismaService.message.count).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-123',
          direction: 'inbound',
          readAt: null,
        },
      });
    });
  });

  describe('getTotalUnreadCount', () => {
    it('should return total unread messages for an account', async () => {
      prismaService.message.count.mockResolvedValue(10);

      const result = await service.getTotalUnreadCount('account-123');

      expect(result).toBe(10);
      expect(prismaService.message.count).toHaveBeenCalledWith({
        where: {
          conversation: {
            accountId: 'account-123',
            status: 'open',
          },
          direction: 'inbound',
          readAt: null,
        },
      });
    });
  });

  describe('getConversations', () => {
    const mockConversationsResult = [
      {
        ...mockConversation,
        messages: [{ ...mockMessage, createdAt: new Date() }],
      },
    ];

    it('should return paginated conversations', async () => {
      prismaService.conversation.findMany.mockResolvedValue(mockConversationsResult);
      prismaService.conversation.count.mockResolvedValue(1);

      const result = await service.getConversations({
        accountId: 'account-123',
        page: 1,
        limit: 20,
      });

      expect(result.conversations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by channel', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);
      prismaService.conversation.count.mockResolvedValue(0);

      await service.getConversations({
        accountId: 'account-123',
        channel: 'telegram',
      });

      const findManyCall = prismaService.conversation.findMany.mock.calls[0][0];
      expect(findManyCall.where.channel).toBe('telegram');
    });

    it('should filter by search query', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);
      prismaService.conversation.count.mockResolvedValue(0);

      await service.getConversations({
        accountId: 'account-123',
        search: 'hello',
      });

      const findManyCall = prismaService.conversation.findMany.mock.calls[0][0];
      expect(findManyCall.where.OR).toBeDefined();
      expect(findManyCall.where.OR).toHaveLength(2);
    });

    it('should filter by unreadOnly', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);
      prismaService.conversation.count.mockResolvedValue(0);

      await service.getConversations({
        accountId: 'account-123',
        unreadOnly: true,
      });

      const findManyCall = prismaService.conversation.findMany.mock.calls[0][0];
      expect(findManyCall.where.unreadCount).toEqual({ gt: 0 });
    });

    it('should filter by assignedToUserId', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);
      prismaService.conversation.count.mockResolvedValue(0);

      await service.getConversations({
        accountId: 'account-123',
        assignedToUserId: 'user-123',
      });

      const findManyCall = prismaService.conversation.findMany.mock.calls[0][0];
      expect(findManyCall.where.assignedToId).toBe('user-123');
    });

    it('should include lastMessage from first message in result', async () => {
      const lastMessage = { ...mockMessage, content: 'Last message' };
      prismaService.conversation.findMany.mockResolvedValue([
        { ...mockConversation, messages: [lastMessage] },
      ]);
      prismaService.conversation.count.mockResolvedValue(1);

      const result = await service.getConversations({
        accountId: 'account-123',
      });

      expect(result.conversations[0].lastMessage).toEqual(lastMessage);
    });

    it('should handle pagination correctly', async () => {
      prismaService.conversation.findMany.mockResolvedValue([]);
      prismaService.conversation.count.mockResolvedValue(50);

      const result = await service.getConversations({
        accountId: 'account-123',
        page: 2,
        limit: 10,
      });

      expect(result.totalPages).toBe(5);
      expect(result.page).toBe(2);

      const findManyCall = prismaService.conversation.findMany.mock.calls[0][0];
      expect(findManyCall.skip).toBe(10); // (page - 1) * limit
      expect(findManyCall.take).toBe(10);
    });
  });

  describe('getConversation', () => {
    it('should return conversation with messages', async () => {
      const conversationWithMessages = {
        ...mockConversation,
        messages: [mockMessage],
      };
      prismaService.conversation.findFirst.mockResolvedValue(conversationWithMessages);

      const result = await service.getConversation('conv-123', 'account-123');

      expect(result).toEqual(conversationWithMessages);
      expect(prismaService.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'conv-123',
          accountId: 'account-123',
        },
        include: expect.objectContaining({
          messages: expect.any(Object),
        }),
      });
    });

    it('should return null when conversation not found', async () => {
      prismaService.conversation.findFirst.mockResolvedValue(null);

      const result = await service.getConversation('nonexistent', 'account-123');

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should update unread messages with readAt timestamp', async () => {
      prismaService.conversation.update.mockResolvedValue(mockConversation);
      prismaService.message.updateMany.mockResolvedValue({ count: 3 });

      await service.markAsRead('conv-123', 'account-123');

      expect(prismaService.message.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-123',
          direction: 'inbound',
          readAt: null,
        },
        data: {
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe('assignConversation', () => {
    it('should update conversation with assigned user', async () => {
      const assignedConversation = {
        ...mockConversation,
        assignedToUserId: 'user-123',
      };
      prismaService.conversation.update.mockResolvedValue(assignedConversation);

      const result = await service.assignConversation('conv-123', 'account-123', 'user-123');

      expect(result.assignedToUserId).toBe('user-123');
      expect(prismaService.conversation.update).toHaveBeenCalledWith({
        where: {
          id: 'conv-123',
          accountId: 'account-123',
        },
        data: {
          assignedToUserId: 'user-123',
        },
      });
    });
  });

  describe('archiveConversation', () => {
    it('should update conversation status to archived', async () => {
      const archivedConversation = {
        ...mockConversation,
        status: 'archived',
      };
      prismaService.conversation.update.mockResolvedValue(archivedConversation);

      const result = await service.archiveConversation('conv-123', 'account-123');

      expect(result.status).toBe('archived');
      expect(prismaService.conversation.update).toHaveBeenCalledWith({
        where: {
          id: 'conv-123',
          accountId: 'account-123',
        },
        data: {
          status: 'archived',
        },
      });
    });
  });

  describe('getStats', () => {
    it('should return conversation statistics', async () => {
      prismaService.conversation.count.mockResolvedValue(10);
      prismaService.message.count.mockResolvedValue(5); // For getTotalUnreadCount
      prismaService.conversation.groupBy.mockResolvedValue([
        { channel: 'telegram', _count: { id: 5 } },
        { channel: 'whatsapp', _count: { id: 3 } },
        { channel: 'telephony', _count: { id: 2 } },
      ]);

      const result = await service.getStats('account-123');

      expect(result.total).toBe(10);
      expect(result.unread).toBe(5);
      expect(result.byChannel).toEqual({
        telegram: 5,
        whatsapp: 3,
        telephony: 2,
      });
    });
  });

  describe('sendMessage', () => {
    it('should create outbound message and update conversation', async () => {
      const newMessage = {
        ...mockMessage,
        id: 'new-msg-123',
        direction: 'outbound',
        content: 'Test message',
        status: 'sent',
      };
      prismaService.message.create.mockResolvedValue(newMessage);
      prismaService.conversation.update.mockResolvedValue(mockConversation);

      const result = await service.sendMessage('conv-123', 'account-123', {
        text: 'Test message',
        userId: 'user-123',
      });

      expect(result).toEqual(newMessage);
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: {
          accountId: 'account-123',
          conversationId: 'conv-123',
          content: 'Test message',
          direction: 'outbound',
          status: 'sent',
          mediaFileId: undefined,
        },
        include: {
          mediaFile: true,
        },
      });
    });

    it('should update conversation lastMessageAt', async () => {
      prismaService.message.create.mockResolvedValue(mockMessage);
      prismaService.conversation.update.mockResolvedValue(mockConversation);

      await service.sendMessage('conv-123', 'account-123', {
        text: 'Test',
        userId: 'user-123',
      });

      expect(prismaService.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-123' },
        data: { lastMessageAt: expect.any(Date) },
      });
    });

    it('should include mediaFileId when provided', async () => {
      prismaService.message.create.mockResolvedValue(mockMessage);
      prismaService.conversation.update.mockResolvedValue(mockConversation);

      await service.sendMessage('conv-123', 'account-123', {
        text: 'Test with media',
        mediaFileId: 'media-123',
        userId: 'user-123',
      });

      const createCall = prismaService.message.create.mock.calls[0][0];
      expect(createCall.data.mediaFileId).toBe('media-123');
    });
  });
});
