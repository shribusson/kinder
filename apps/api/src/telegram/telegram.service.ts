import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.module';
import { Telegraf, Context } from 'telegraf';
import { Message } from 'telegraf/types';

export interface SendMessageOptions {
  accountId: string;
  chatId: string | number;
  text?: string;
  photo?: string;
  video?: string;
  document?: string;
  audio?: string;
  conversationId?: number;
  replyToMessageId?: number;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bots: Map<number, Telegraf> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.OUTBOUND_MESSAGES) private outboundQueue: Queue,
  ) {}

  async onModuleInit() {
    // Initialize bots for all active Telegram integrations
    const integrations = await this.prisma.integration.findMany({
      where: {
        platform: 'TELEGRAM',
        isActive: true,
      },
    });

    for (const integration of integrations) {
      await this.initializeBot(integration.id, integration.accountId);
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

    if (!integration || integration.channel !== 'TELEGRAM') {
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
      await bot.telegram.setWebhook(webhookUrl);
      this.logger.log(`Telegram bot ${integrationId} webhook set: ${webhookUrl}`);
    } else {
      // Polling mode (for development)
      bot.launch();
      this.logger.log(`Telegram bot ${integrationId} launched in polling mode`);
    }

    this.bots.set(integrationId, bot);
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
          `Статус: ${lead.status}\n` +
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
      const chatId = ctx.chat.id.toString();
      const from = ctx.from;

      // Get or create conversation
      const conversation = await this.prisma.conversation.upsert({
        where: {
          accountId_integrationId_externalId: {
            accountId,
            integrationId,
            externalId: chatId,
          },
        },
        create: {
          accountId,
          integrationId,
          externalId: chatId,
          channel: 'TELEGRAM',
          metadata: {
            username: from?.username,
            firstName: from?.first_name,
            lastName: from?.last_name,
          },
        },
        update: {
          updatedAt: new Date(),
        },
      });

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
          conversationId: conversation.id,
          externalId: message.message_id.toString(),
          direction: 'inbound',
          channel: 'TELEGRAM',
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
          status: 'received',
          receivedAt: new Date(message.date * 1000),
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
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

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
          mediaFiles: {
            connect: { id: mediaFile.id },
          },
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
  async sendMessage(options: SendMessageOptions): Promise<{ messageId: string }> {
    // Get Telegram integration for this account
    const integration = await this.prisma.integration.findFirst({
      where: {
        accountId: options.accountId,
        platform: 'TELEGRAM',
        isActive: true,
      },
    });

    if (!integration) {
      throw new Error(`No active Telegram integration for account ${options.accountId}`);
    }

    // Create conversation if not exists
    let conversationId = options.conversationId;
    if (!conversationId) {
      const conversation = await this.prisma.conversation.upsert({
        where: {
          accountId_integrationId_externalId: {
            accountId: options.accountId,
            integrationId: integration.id,
            externalId: options.chatId.toString(),
          },
        },
        create: {
          accountId: options.accountId,
          integrationId: integration.id,
          externalId: options.chatId.toString(),
          channel: 'TELEGRAM',
        },
        update: {},
      });
      conversationId = conversation.id;
    }

    // Create message record
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        direction: 'outbound',
        channel: 'TELEGRAM',
        content: options.text || '[Media]',
        status: 'pending',
      },
    });

    // Queue message sending
    await this.outboundQueue.add('send-telegram', {
      messageId: message.id,
      integrationId: integration.id,
      chatId: options.chatId,
      text: options.text,
      photo: options.photo,
      video: options.video,
      document: options.document,
      audio: options.audio,
      replyToMessageId: options.replyToMessageId,
    });

    this.logger.log(`Telegram message queued: ${message.id}`);

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
    const bot = this.bots.get(integrationId);
    if (!bot) {
      throw new Error(`Bot ${integrationId} not found`);
    }

    try {
      let result: Message;

      if (options.photo) {
        result = await bot.telegram.sendPhoto(chatId, options.photo, {
          caption: options.text,
          reply_parameters: options.replyToMessageId ? { message_id: options.replyToMessageId } : undefined,
        });
      } else if (options.video) {
        result = await bot.telegram.sendVideo(chatId, options.video, {
          caption: options.text,
          reply_parameters: options.replyToMessageId ? { message_id: options.replyToMessageId } : undefined,
        });
      } else if (options.document) {
        result = await bot.telegram.sendDocument(chatId, options.document, {
          caption: options.text,
          reply_parameters: options.replyToMessageId ? { message_id: options.replyToMessageId } : undefined,
        });
      } else if (options.audio) {
        result = await bot.telegram.sendAudio(chatId, options.audio, {
          caption: options.text,
          reply_parameters: options.replyToMessageId ? { message_id: options.replyToMessageId } : undefined,
        });
      } else {
        result = await bot.telegram.sendMessage(chatId, options.text, {
          reply_parameters: options.replyToMessageId ? { message_id: options.replyToMessageId } : undefined,
        });
      }

      // Update message with external ID
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          externalId: result.message_id.toString(),
          status: 'sent',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Telegram message sent: ${messageId} -> ${result.message_id}`);
    } catch (error) {
      this.logger.error(`Failed to send Telegram message ${messageId}:`, error);

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Process webhook update
   */
  async processWebhook(integrationId: string, update: any): Promise<void> {
    const bot = this.bots.get(integrationId);
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
    accountId: string,
    message: string,
    options?: { parseMode?: 'Markdown' | 'HTML' },
  ): Promise<void> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        accountId,
        platform: 'TELEGRAM',
        isActive: true,
      },
    });

    if (!integration) {
      this.logger.warn(`No Telegram integration for account ${accountId}`);
      return;
    }

    const config = integration.settings as any;
    if (!config.managerGroupId) {
      this.logger.warn(`No manager group configured for account ${accountId}`);
      return;
    }

    const bot = this.bots.get(integration.id);
    if (!bot) {
      throw new Error(`Bot ${integration.id} not found`);
    }

    try {
      await bot.telegram.sendMessage(config.managerGroupId, message, {
        parse_mode: options?.parseMode,
      });

      this.logger.log(`Manager notification sent to account ${accountId}`);
    } catch (error) {
      this.logger.error('Failed to send manager notification:', error);
    }
  }

  /**
   * Get bot for integration
   */
  getBot(integrationId: string): Telegraf | undefined {
    return this.bots.get(integrationId);
  }
}
