import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.module';
import { MessageStatus } from '@prisma/client';
import axios from 'axios';

export interface SendMessageOptions {
  accountId: string;
  to: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
  content: string | { url: string; caption?: string } | { templateName: string; language: string; components?: any[] };
  conversationId?: number;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private whatsappClients: Map<number, WhatsApp> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.OUTBOUND_MESSAGES) private outboundQueue: Queue,
  ) {}

  /**
   * Get or create WhatsApp client for an integration
   */
  private async getClient(integrationId: string): Promise<WhatsApp> {
    if (this.whatsappClients.has(integrationId)) {
      return this.whatsappClients.get(integrationId)!;
    }

    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== 'WHATSAPP') {
      throw new Error(`WhatsApp integration ${integrationId} not found`);
    }

    const config = integration.settings as any;
    const client = new WhatsApp({
      token: config.accessToken,
      phoneNumberId: config.phoneNumberId,
      businessAccountId: config.businessAccountId,
    });

    this.whatsappClients.set(integrationId, client);
    this.logger.log(`WhatsApp client created for integration ${integrationId}`);

    return client;
  }

  /**
   * Send a WhatsApp message (queued)
   */
  async sendMessage(options: SendMessageOptions): Promise<{ messageId: string }> {
    // Get WhatsApp integration for this account
    const integration = await this.prisma.integration.findFirst({
      where: {
        accountId: options.accountId,
        platform: 'WHATSAPP',
        isActive: true,
      },
    });

    if (!integration) {
      throw new Error(`No active WhatsApp integration for account ${options.accountId}`);
    }

    // Create conversation if not exists
    let conversationId = options.conversationId;
    if (!conversationId) {
      const conversation = await this.prisma.conversation.upsert({
        where: {
          accountId_integrationId_externalId: {
            accountId: options.accountId,
            integrationId: integration.id,
            externalId: options.to,
          },
        },
        create: {
          accountId: options.accountId,
          integrationId: integration.id,
          externalId: options.to,
          channel: 'WHATSAPP',
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
        channel: 'WHATSAPP',
        content: typeof options.content === 'string' ? options.content : JSON.stringify(options.content),
        status: 'pending',
      },
    });

    // Queue message sending
    await this.outboundQueue.add('send-whatsapp', {
      messageId: message.id,
      integrationId: integration.id,
      to: options.to,
      type: options.type,
      content: options.content,
    });

    this.logger.log(`WhatsApp message queued: ${message.id}`);

    return { messageId: message.id };
  }

  /**
   * Actually send the WhatsApp message (called by queue processor)
   */
  async sendMessageNow(
    integrationId: string,
    messageId: string,
    to: string,
    type: string,
    content: any,
  ): Promise<void> {
    const client = await this.getClient(integrationId);

    try {
      let result: any;

      switch (type) {
        case 'text':
          result = await client.sendText(to, content);
          break;

        case 'image':
          result = await client.sendImage(to, content.url, content.caption);
          break;

        case 'video':
          result = await client.sendVideo(to, content.url, content.caption);
          break;

        case 'document':
          result = await client.sendDocument(to, content.url, content.caption);
          break;

        case 'audio':
          result = await client.sendAudio(to, content.url);
          break;

        case 'template':
          result = await client.sendTemplate(
            to,
            content.templateName,
            content.language,
            content.components,
          );
          break;

        default:
          throw new Error(`Unsupported message type: ${type}`);
      }

      // Update message with external ID
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          externalId: result.messages?.[0]?.id,
          status: 'sent',
          sentAt: new Date(),
        },
      });

      this.logger.log(`WhatsApp message sent: ${messageId} -> ${result.messages?.[0]?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message ${messageId}:`, error);

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Process incoming WhatsApp webhook
   */
  async processWebhook(integrationId: string, payload: any): Promise<void> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    try {
      // Parse webhook payload
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        this.logger.warn('Invalid WhatsApp webhook payload');
        return;
      }

      // Handle status updates
      if (value.statuses) {
        await this.handleStatusUpdates(integration.accountId, value.statuses);
      }

      // Handle incoming messages
      if (value.messages) {
        await this.handleIncomingMessages(integration.id, integration.accountId, value);
      }

      this.logger.log(`WhatsApp webhook processed for integration ${integrationId}`);
    } catch (error) {
      this.logger.error(`Error processing WhatsApp webhook:`, error);
      throw error;
    }
  }

  /**
   * Handle message status updates
   */
  private async handleStatusUpdates(accountId: string, statuses: any[]): Promise<void> {
    for (const status of statuses) {
      const { id, status: messageStatus, timestamp } = status;

      await this.prisma.message.updateMany({
        where: {
          externalId: id,
          conversation: { accountId },
        },
        data: {
          status: this.mapWhatsAppStatus(messageStatus),
          deliveredAt: messageStatus === 'delivered' ? new Date(parseInt(timestamp) * 1000) : undefined,
          readAt: messageStatus === 'read' ? new Date(parseInt(timestamp) * 1000) : undefined,
        },
      });

      this.logger.debug(`WhatsApp status update: ${id} -> ${messageStatus}`);
    }
  }

  /**
   * Handle incoming messages
   */
  private async handleIncomingMessages(
    integrationId: string,
    accountId: string,
    value: any,
  ): Promise<void> {
    const { messages, contacts } = value;

    for (const msg of messages) {
      const { from, id, timestamp, type } = msg;

      // Get or create conversation
      const conversation = await this.prisma.conversation.upsert({
        where: {
          accountId_integrationId_externalId: {
            accountId,
            integrationId,
            externalId: from,
          },
        },
        create: {
          accountId,
          integrationId,
          externalId: from,
          channel: 'WHATSAPP',
          metadata: {
            contact: contacts?.[0],
          },
        },
        update: {
          updatedAt: new Date(),
        },
      });

      // Extract message content
      let content = '';
      let mediaUrl: string | null = null;

      switch (type) {
        case 'text':
          content = msg.text.body;
          break;
        case 'image':
          content = msg.image.caption || '[Image]';
          mediaUrl = msg.image.id;
          break;
        case 'video':
          content = msg.video.caption || '[Video]';
          mediaUrl = msg.video.id;
          break;
        case 'document':
          content = msg.document.filename || '[Document]';
          mediaUrl = msg.document.id;
          break;
        case 'audio':
          content = '[Audio]';
          mediaUrl = msg.audio.id;
          break;
        default:
          content = `[${type}]`;
      }

      // Create message record
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalId: id,
          direction: 'inbound',
          channel: 'WHATSAPP',
          content,
          metadata: {
            type,
            from: contacts?.[0],
            mediaId: mediaUrl,
          },
          status: 'received',
          receivedAt: new Date(parseInt(timestamp) * 1000),
        },
      });

      // Download media if present
      if (mediaUrl) {
        await this.downloadMedia(accountId, integrationId, mediaUrl, message.id);
      }

      this.logger.log(`WhatsApp message received: ${id} from ${from}`);
    }
  }

  /**
   * Download media from WhatsApp
   */
  private async downloadMedia(
    accountId: string,
    integrationId: string,
    mediaId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const client = await this.getClient(integrationId);
      
      // Get media URL
      const mediaInfo = await client.getMedia(mediaId);
      
      // Download media
      const response = await fetch(mediaInfo.url, {
        headers: {
          Authorization: `Bearer ${(await this.getClient(integrationId)) as any}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download media: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload to S3
      const storageKey = this.storageService.generateKey(
        accountId,
        'whatsapp-media',
        `${mediaId}.${mediaInfo.mime_type?.split('/')[1] || 'bin'}`,
      );

      const { url } = await this.storageService.upload({
        key: storageKey,
        body: buffer,
        contentType: mediaInfo.mime_type,
      });

      // Create MediaFile record
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          accountId,
          name: `${mediaId}.${mediaInfo.mime_type?.split('/')[1]}`,
          mimeType: mediaInfo.mime_type,
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

      this.logger.log(`WhatsApp media downloaded: ${mediaId} -> ${url}`);
    } catch (error) {
      this.logger.error(`Failed to download WhatsApp media ${mediaId}:`, error);
    }
  }

  /**
   * Map WhatsApp status to our MessageStatus enum
   */
  private mapWhatsAppStatus(status: string): MessageStatus {
    const mapping: Record<string, MessageStatus> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    };

    return mapping[status] || 'sent';
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const digest = hmac.digest('hex');

    return signature === `sha256=${digest}`;
  }
}
