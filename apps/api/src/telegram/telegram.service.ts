import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { Telegraf, Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { InteractionChannel, IntegrationStatus, ConversationStatus, MessageDirection, MessageStatus } from '@prisma/client';
import {
  TelegramBusinessConnection,
  TelegramBusinessMessage,
  TelegramDeletedBusinessMessages,
} from '../common/types/request.types';

export interface SendMessageOptions {
  accountId: string;
  chatId: string | number;
  text?: string;
  photo?: string;
  video?: string;
  document?: string;
  audio?: string;
  conversationId?: string;
  replyToMessageId?: number;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bots: Map<string, Telegraf> = new Map();
  private botTokens: Map<string, string> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.OUTBOUND_MESSAGES) private outboundQueue: Queue,
  ) {}

  async onModuleInit() {
    // Initialize bots for all active Telegram integrations
    const integrations = await this.prisma.integration.findMany({
      where: {
        channel: InteractionChannel.telegram,
        status: IntegrationStatus.active,
      },
    });

    for (const integration of integrations) {
      try {
        await this.initializeBot(integration.id, integration.accountId);
      } catch (error) {
        this.logger.error(`Failed to initialize bot ${integration.id}:`, error);
      }
    }

    this.logger.log(`Initialized ${integrations.length} Telegram bots`);
  }

  /**
   * Initialize a Telegram bot for an integration
   */
  private async initializeBot(integrationId: string, accountId: string): Promise<void> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== InteractionChannel.telegram) {
      throw new Error(`Telegram integration ${integrationId} not found`);
    }

    const config = integration.settings as any;
    const bot = new Telegraf(config.botToken);

    // Register handlers
    this.registerHandlers(bot, integrationId, accountId);

    // Start bot
    if (config.useWebhook) {
      // Webhook mode (recommended for production)
      const webhookUrl = `${process.env.API_URL}/telegram/webhook/${integrationId}`;
      await bot.telegram.setWebhook(webhookUrl, {
        allowed_updates: [
          'message', 'edited_message', 'callback_query',
          'business_connection', 'business_message',
          'edited_business_message', 'deleted_business_messages',
        ] as any,
      });
      this.logger.log(`Telegram bot ${integrationId} webhook set: ${webhookUrl}`);
    } else {
      // Polling mode (for development)
      bot.launch();
      this.logger.log(`Telegram bot ${integrationId} launched in polling mode`);
    }

    this.bots.set(integrationId, bot);
    this.botTokens.set(integrationId, config.botToken);
  }

  /**
   * Register message and command handlers
   */
  private registerHandlers(bot: Telegraf, integrationId: string, accountId: string): void {
    // Start command
    bot.command('start', async (ctx) => {
      await ctx.reply(
        'Добро пожаловать в Kinder Education Center!\n\n' +
        'Я помогу вам с:\n' +
        '• Записью на курсы\n' +
        '• Информацией о расписании\n' +
        '• Ответами на вопросы\n\n' +
        'Просто напишите ваш вопрос!',
      );
    });

    // Help command
    bot.command('help', async (ctx) => {
      await ctx.reply(
        'Доступные команды:\n\n' +
        '/start - Начать общение\n' +
        '/help - Показать справку\n' +
        '/status - Статус вашей заявки\n\n' +
        'Вы также можете просто написать ваш вопрос, и мы ответим!',
      );
    });

    // Status command
    bot.command('status', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      
      // Find leads for this chat
      const leads = await this.prisma.lead.findMany({
        where: {
          accountId,
          phone: chatId, // Simplified - in production use proper phone matching
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      if (leads.length === 0) {
        await ctx.reply('У вас пока нет активных заявок.');
      } else {
        const lead = leads[0];
        await ctx.reply(
          `Статус вашей заявки:\n\n` +
          `ID: ${lead.id}\n` +
          `Статус: ${lead.stage}\n` +
          `Создана: ${lead.createdAt.toLocaleDateString('ru-RU')}`,
        );
      }
    });

    // Text messages
    bot.on('text', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });

    // Photos
    bot.on('photo', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });

    // Videos
    bot.on('video', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });

    // Documents
    bot.on('document', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });

    // Voice messages
    bot.on('voice', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });

    // Audio
    bot.on('audio', async (ctx) => {
      await this.handleMessage(integrationId, accountId, ctx);
    });
  }

  /**
   * Handle incoming Telegram message
   */
  private async handleMessage(
    integrationId: string,
    accountId: string,
    ctx: Context,
  ): Promise<void> {
    try {
      const message = ctx.message as Message;
      if (!ctx.chat) {
        this.logger.warn('No chat in context');
        return;
      }
      const chatId = ctx.chat.id.toString();
      const from = ctx.from;

      // Get or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          accountId,
          channel: InteractionChannel.telegram,
          metadata: {
            path: ['chatId'],
            equals: chatId,
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            account: { connect: { id: accountId } },
            channel: InteractionChannel.telegram,
            status: ConversationStatus.open,
            metadata: {
              chatId,
              username: from?.username,
              firstName: from?.first_name,
              lastName: from?.last_name,
            },
          },
        });
      }

      // Extract message content
      let content = '';
      let mediaUrl: string | null = null;

      if ('text' in message) {
        content = message.text;
      } else if ('photo' in message) {
        const photo = message.photo[message.photo.length - 1];
        content = message.caption || '[Photo]';
        mediaUrl = photo.file_id;
      } else if ('video' in message) {
        content = message.caption || '[Video]';
        mediaUrl = message.video.file_id;
      } else if ('document' in message) {
        content = message.document.file_name || '[Document]';
        mediaUrl = message.document.file_id;
      } else if ('voice' in message) {
        content = '[Voice message]';
        mediaUrl = message.voice.file_id;
      } else if ('audio' in message) {
        content = '[Audio]';
        mediaUrl = message.audio.file_id;
      }

      // Create message record
      const msg = await this.prisma.message.create({
        data: {
          conversation: { connect: { id: conversation.id } },
          account: { connect: { id: accountId } },
          externalId: message.message_id.toString(),
          direction: MessageDirection.inbound,
          content,
          metadata: {
            from: {
              id: from?.id,
              username: from?.username,
              first_name: from?.first_name,
              last_name: from?.last_name,
            },
            fileId: mediaUrl,
          },
          status: MessageStatus.delivered,
        },
      });

      // Download media if present
      if (mediaUrl) {
        await this.downloadMedia(integrationId, accountId, mediaUrl, msg.id);
      }

      this.logger.log(`Telegram message received: ${message.message_id} from ${chatId}`);

      // Send auto-reply for first message
      if (!conversation.lastMessageAt) {
        await ctx.reply(
          'Спасибо за ваше сообщение! Наш менеджер свяжется с вами в ближайшее время.',
        );
      }
    } catch (error) {
      this.logger.error('Error handling Telegram message:', error);
    }
  }

  /**
   * Download media from Telegram
   */
  private async downloadMedia(
    integrationId: string,
    accountId: string,
    fileId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const bot = this.bots.get(integrationId);
      if (!bot) {
        throw new Error(`Bot ${integrationId} not found`);
      }

      // Get file info
      const file = await bot.telegram.getFile(fileId);
      const botToken = this.botTokens.get(integrationId);
      if (!botToken) {
        throw new Error(`Bot token not found for integration ${integrationId}`);
      }
      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;

      // Download file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload to S3
      const filename = file.file_path?.split('/').pop() || `${fileId}.bin`;
      const storageKey = this.storageService.generateKey(
        accountId,
        'telegram-media',
        filename,
      );

      const { url } = await this.storageService.upload({
        key: storageKey,
        body: buffer,
      });

      // Create MediaFile record
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          accountId,
          name: filename,
          fileSize: buffer.length,
          storageKey,
          url,
        },
      });

      // Link to message
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          mediaFileId: mediaFile.id,
        },
      });

      this.logger.log(`Telegram media downloaded: ${fileId} -> ${url}`);
    } catch (error) {
      this.logger.error(`Failed to download Telegram media ${fileId}:`, error);
    }
  }

  /**
   * Send a Telegram message (queued)
   */
  async sendMessage(
    integrationId: string,
    chatId: string | number,
    options: { text?: string; photo?: string; video?: string; document?: string; audio?: string; replyToMessageId?: number; businessConnectionId?: string }
  ): Promise<{ messageId: string }> {
    // Get Telegram integration
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error(`Telegram integration ${integrationId} not found`);
    }

    // Find or create conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        accountId: integration.accountId,
        channel: InteractionChannel.telegram,
        metadata: {
          path: ['chatId'],
          equals: chatId.toString(),
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          account: { connect: { id: integration.accountId } },
          channel: InteractionChannel.telegram,
          status: ConversationStatus.open,
          metadata: { chatId: chatId.toString() },
        },
      });
    }

    // Auto-detect businessConnectionId from conversation metadata
    let businessConnectionId = options.businessConnectionId;
    if (!businessConnectionId) {
      const meta = conversation.metadata as any;
      if (meta?.businessConnectionId) {
        businessConnectionId = meta.businessConnectionId;
      }
    }

    // Create message record
    const message = await this.prisma.message.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        account: { connect: { id: integration.accountId } },
        direction: MessageDirection.outbound,
        content: options.text || '[Media]',
        status: MessageStatus.pending,
        metadata: businessConnectionId ? { businessConnectionId } : undefined,
      },
    });

    // Queue message sending
    await this.outboundQueue.add('send-telegram', {
      messageId: message.id,
      integrationId,
      chatId,
      text: options.text,
      photo: options.photo,
      video: options.video,
      document: options.document,
      audio: options.audio,
      replyToMessageId: options.replyToMessageId,
      businessConnectionId,
    });

    this.logger.log(`Telegram message queued: ${message.id}${businessConnectionId ? ' (business)' : ''}`);

    return { messageId: message.id };
  }

  /**
   * Actually send the Telegram message (called by queue processor)
   */
  async sendMessageNow(
    integrationId: string,
    messageId: string,
    chatId: string | number,
    options: any,
  ): Promise<void> {
    let bot = this.bots.get(integrationId);
    if (!bot) {
      // Try to initialize bot on the fly
      const integration = await this.prisma.integration.findUnique({
        where: { id: integrationId },
      });
      if (integration) {
        await this.initializeBot(integrationId, integration.accountId);
        bot = this.bots.get(integrationId);
      }
    }

    if (!bot) {
      throw new Error(`Bot ${integrationId} not found`);
    }

    try {
      let result: Message;

      // Build extra params for business connection + reply
      const extra: any = {};
      if (options.businessConnectionId) {
        extra.business_connection_id = options.businessConnectionId;
      }
      if (options.replyToMessageId) {
        extra.reply_parameters = { message_id: options.replyToMessageId };
      }

      if (options.photo) {
        result = await bot.telegram.sendPhoto(chatId, options.photo, {
          caption: options.text,
          ...extra,
        });
      } else if (options.video) {
        result = await bot.telegram.sendVideo(chatId, options.video, {
          caption: options.text,
          ...extra,
        });
      } else if (options.document) {
        result = await bot.telegram.sendDocument(chatId, options.document, {
          caption: options.text,
          ...extra,
        });
      } else if (options.audio) {
        result = await bot.telegram.sendAudio(chatId, options.audio, {
          caption: options.text,
          ...extra,
        });
      } else {
        result = await bot.telegram.sendMessage(chatId, options.text, extra);
      }

      // Update message with external ID
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          externalId: result.message_id.toString(),
          status: MessageStatus.sent,
        },
      });

      this.logger.log(
        `Telegram message sent: ${messageId} -> ${result.message_id}${options.businessConnectionId ? ' (via business)' : ''}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send Telegram message ${messageId}:`, error);

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.failed },
      });

      throw error;
    }
  }

  /**
   * Process webhook update
   */
  async processWebhook(integrationId: string, update: any): Promise<void> {
    let bot = this.bots.get(integrationId);
    if (!bot) {
      // Try to initialize bot on the fly
      const integration = await this.prisma.integration.findUnique({
        where: { id: integrationId },
      });
      if (integration) {
        await this.initializeBot(integrationId, integration.accountId);
        bot = this.bots.get(integrationId);
      }
    }

    if (!bot) {
      throw new Error(`Bot ${integrationId} not found`);
    }

    try {
      await bot.handleUpdate(update);
    } catch (error) {
      this.logger.error('Error processing Telegram webhook:', error);
      throw error;
    }
  }

  /**
   * Send notification to manager group
   */
  async notifyManagers(
    integrationId: string,
    message: string,
    options?: { parseMode?: 'Markdown' | 'HTML' },
  ): Promise<void> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      this.logger.warn(`Telegram integration ${integrationId} not found`);
      return;
    }

    const config = integration.settings as any;
    const managerGroupId = config?.managerGroupId || process.env.TELEGRAM_MANAGER_CHAT_ID;

    if (!managerGroupId) {
      this.logger.warn(`No manager group configured for integration ${integrationId}`);
      return;
    }

    const bot = this.bots.get(integrationId);
    if (!bot) {
      // Try to initialize bot on the fly
      try {
        await this.initializeBot(integrationId, integration.accountId);
      } catch (error) {
        this.logger.error(`Failed to initialize bot ${integrationId}:`, error);
        return;
      }
    }

    const activeBot = this.bots.get(integrationId);
    if (!activeBot) {
      this.logger.error(`Bot ${integrationId} still not available`);
      return;
    }

    try {
      await activeBot.telegram.sendMessage(managerGroupId, message, {
        parse_mode: options?.parseMode,
      });

      this.logger.log(`Manager notification sent via integration ${integrationId}`);
    } catch (error) {
      this.logger.error('Failed to send manager notification:', error);
    }
  }

  // =========================================
  // Telegram Business Account handlers
  // =========================================

  /**
   * Handle business_connection update — store connection info
   */
  async handleBusinessConnection(
    integrationId: string,
    accountId: string,
    connection: TelegramBusinessConnection,
  ): Promise<void> {
    try {
      const integration = await this.prisma.integration.findUnique({
        where: { id: integrationId },
      });

      if (!integration) {
        this.logger.warn(`Integration ${integrationId} not found for business connection`);
        return;
      }

      const settings = (integration.settings as any) || {};
      const businessConnections = settings.businessConnections || {};

      if (connection.is_enabled) {
        businessConnections[connection.id] = {
          id: connection.id,
          userId: connection.user.id,
          userChatId: connection.user_chat_id,
          username: connection.user.username,
          firstName: connection.user.first_name,
          lastName: connection.user.last_name,
          canReply: connection.can_reply,
          isEnabled: true,
          connectedAt: new Date(connection.date * 1000).toISOString(),
        };
        this.logger.log(
          `Business connection established: ${connection.id} (user: ${connection.user.first_name} @${connection.user.username})`,
        );
      } else {
        if (businessConnections[connection.id]) {
          businessConnections[connection.id].isEnabled = false;
          businessConnections[connection.id].disconnectedAt = new Date().toISOString();
        }
        this.logger.log(`Business connection disabled: ${connection.id}`);
      }

      await this.prisma.integration.update({
        where: { id: integrationId },
        data: {
          settings: { ...settings, businessConnections },
        },
      });
    } catch (error) {
      this.logger.error('Error handling business connection:', error);
    }
  }

  /**
   * Handle incoming business message (customer chatting with business account)
   */
  async handleBusinessMessage(
    integrationId: string,
    accountId: string,
    message: TelegramBusinessMessage,
  ): Promise<void> {
    try {
      const chatId = message.chat.id.toString();
      const from = message.from;
      const businessConnectionId = message.business_connection_id;

      // Find or create conversation keyed by chatId + businessConnectionId
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          accountId,
          channel: InteractionChannel.telegram,
          AND: [
            { metadata: { path: ['chatId'], equals: chatId } },
            { metadata: { path: ['businessConnectionId'], equals: businessConnectionId } },
          ],
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            account: { connect: { id: accountId } },
            channel: InteractionChannel.telegram,
            status: ConversationStatus.open,
            metadata: {
              chatId,
              username: from?.username,
              firstName: from?.first_name,
              lastName: from?.last_name,
              businessConnectionId,
              conversationType: 'business',
            },
          },
        });
      }

      // Extract content
      let content = '';
      let mediaFileId: string | null = null;

      if (message.text) {
        content = message.text;
      } else if (message.photo && message.photo.length > 0) {
        const photo = message.photo[message.photo.length - 1];
        content = message.caption || '[Photo]';
        mediaFileId = photo.file_id;
      } else if (message.video) {
        content = message.caption || '[Video]';
        mediaFileId = message.video.file_id;
      } else if (message.document) {
        content = message.document.file_name || '[Document]';
        mediaFileId = message.document.file_id;
      } else if (message.voice) {
        content = '[Voice message]';
        mediaFileId = message.voice.file_id;
      } else if (message.audio) {
        content = '[Audio]';
        mediaFileId = message.audio.file_id;
      }

      // Create message record
      const msg = await this.prisma.message.create({
        data: {
          conversation: { connect: { id: conversation.id } },
          account: { connect: { id: accountId } },
          externalId: message.message_id.toString(),
          direction: MessageDirection.inbound,
          content,
          metadata: {
            from: {
              id: from?.id,
              username: from?.username,
              first_name: from?.first_name,
              last_name: from?.last_name,
            },
            fileId: mediaFileId,
            businessConnectionId,
          },
          status: MessageStatus.delivered,
        },
      });

      // Update conversation lastMessageAt
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      // Download media if present
      if (mediaFileId) {
        await this.downloadMedia(integrationId, accountId, mediaFileId, msg.id);
      }

      this.logger.log(
        `Business message received: ${message.message_id} from chat ${chatId} (connection: ${businessConnectionId})`,
      );
    } catch (error) {
      this.logger.error('Error handling business message:', error);
    }
  }

  /**
   * Handle edited business message
   */
  async handleEditedBusinessMessage(
    integrationId: string,
    accountId: string,
    message: TelegramBusinessMessage,
  ): Promise<void> {
    try {
      const existingMessage = await this.prisma.message.findFirst({
        where: {
          accountId,
          externalId: message.message_id.toString(),
        },
      });

      if (!existingMessage) {
        this.logger.warn(`Edited business message not found: ${message.message_id}`);
        return;
      }

      let content = message.text || message.caption || existingMessage.content;

      await this.prisma.message.update({
        where: { id: existingMessage.id },
        data: {
          content,
          metadata: {
            ...(existingMessage.metadata as any),
            editedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`Business message edited: ${message.message_id}`);
    } catch (error) {
      this.logger.error('Error handling edited business message:', error);
    }
  }

  /**
   * Handle deleted business messages
   */
  async handleDeletedBusinessMessages(
    integrationId: string,
    accountId: string,
    deleted: TelegramDeletedBusinessMessages,
  ): Promise<void> {
    try {
      const messageIds = deleted.message_ids.map(id => id.toString());

      const messages = await this.prisma.message.findMany({
        where: {
          accountId,
          externalId: { in: messageIds },
        },
      });

      for (const msg of messages) {
        const meta = (msg.metadata as any) || {};
        if (meta.businessConnectionId === deleted.business_connection_id) {
          await this.prisma.message.update({
            where: { id: msg.id },
            data: {
              metadata: {
                ...meta,
                deletedAt: new Date().toISOString(),
                deletedFromBusiness: true,
              },
            },
          });
        }
      }

      this.logger.log(
        `Business messages deleted: ${messageIds.join(', ')} (connection: ${deleted.business_connection_id})`,
      );
    } catch (error) {
      this.logger.error('Error handling deleted business messages:', error);
    }
  }

  /**
   * Get bot for integration
   */
  getBot(integrationId: string): Telegraf | undefined {
    return this.bots.get(integrationId);
  }
}
