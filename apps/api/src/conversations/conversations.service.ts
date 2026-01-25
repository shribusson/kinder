import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InteractionChannel } from '@prisma/client';

export interface GetConversationsOptions {
  accountId: string;
  channel?: InteractionChannel;
  search?: string;
  unreadOnly?: boolean;
  assignedToUserId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated conversations with filters
   */
  async getConversations(options: GetConversationsOptions) {
    const {
      accountId,
      channel,
      search,
      unreadOnly,
      assignedToUserId,
      page = 1,
      limit = 20,
    } = options;

    const where: any = {
      accountId,
    };

    if (channel) {
      where.channel = channel;
    }

    if (unreadOnly) {
      where.unreadCount = { gt: 0 };
    }

    if (assignedToUserId) {
      where.assignedToId = assignedToUserId;
    }

    if (search) {
      where.OR = [
        { externalId: { contains: search, mode: 'insensitive' } },
        {
          messages: {
            some: {
              content: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              direction: true,
              createdAt: true,
              status: true,
            },
          },
        },
        orderBy: [
          { lastMessageAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      conversations: conversations.map((conv) => ({
        ...conv,
        lastMessage: null, // TODO: query separately
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single conversation with messages
   */
  async getConversation(conversationId: string, accountId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        accountId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
          },
        },
        lead: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            mediaFile: true,
          },
        },
      },
    });

    return conversation;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, accountId: string) {
    await this.prisma.conversation.update({
      where: {
        id: conversationId,
        accountId,
      },
      data: {},
    });

    // Update message statuses
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        direction: 'inbound',
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Assign conversation to user
   */
  async assignConversation(
    conversationId: string,
    accountId: string,
    userId: string,
  ) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        accountId,
      },
      data: {
        assignedToUserId: userId,
      },
    });
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string, accountId: string) {
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        accountId,
      },
      data: {
        status: 'archived' as any,
      },
    });
  }

  /**
   * Get conversation statistics
   */
  async getStats(accountId: string) {
    const [total, byChannel] = await Promise.all([
      this.prisma.conversation.count({
        where: { accountId, status: { not: 'archived' } },
      }),
      this.prisma.conversation.groupBy({
        by: ['channel'],
        where: { accountId, status: { not: 'archived' } },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      unread: 0, // TODO: implement unread tracking
      byChannel: byChannel.reduce((acc, item) => {
        acc[item.channel] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
