import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.module';
import { MessageStatus, MessageDirection, InteractionChannel, ConversationStatus } from '@prisma/client';

export interface SendMessageOptions {
  accountId: string;
  to: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
  content: string | { url: string; caption?: string } | { templateName: string; language: string; components?: any[] };
  conversationId?: string;
}

interface WhatsAppClientConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private clientConfigs: Map<string, WhatsAppClientConfig> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    @InjectQueue(QUEUE_NAMES.OUTBOUND_MESSAGES) private outboundQueue: Queue,
  ) {}

  /**
   * Get client config for an integration
   */
  private async getClientConfig(integrationId: string): Promise<WhatsAppClientConfig> {
    if (this.clientConfigs.has(integrationId)) {
      return this.clientConfigs.get(integrationId)!;
    }

    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.channel !== InteractionChannel.whatsapp) {
      throw new Error(`WhatsApp integration ${integrationId} not found`);
    }

    const settings = integration.settings as any;
    const config: WhatsAppClientConfig = {
      accessToken: settings.accessToken,
      phoneNumberId: settings.phoneNumberId,
      businessAccountId: settings.businessAccountId,
    };

    this.clientConfigs.set(integrationId, config);
    this.logger.log(`WhatsApp client config loaded for integration ${integrationId}`);

    return config;
  }

  /**
   * Send a WhatsApp message (queued)
   */
  async sendMessage(options: SendMessageOptions): Promise<{ messageId: string }> {
    // Get WhatsApp integration for this account
    const integration = await this.prisma.integration.findFirst({
      where: {
        accountId: options.accountId,
        channel: InteractionChannel.whatsapp,
        status: 'active',
      },
    });

    if (!integration) {
      throw new Error(`No active WhatsApp integration for account ${options.accountId}`);
    }

    // Find or create conversation
    let conversationId = options.conversationId;
    if (!conversationId) {
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          accountId: options.accountId,
          channel: InteractionChannel.whatsapp,
          metadata: {
            path: ['phone'],
            equals: options.to,
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            account: { connect: { id: options.accountId } },
            channel: InteractionChannel.whatsapp,
            status: ConversationStatus.open,
            metadata: { phone: options.to },
          },
        });
      }
      conversationId = conversation.id;
    }

    // Create message record
    const message = await this.prisma.message.create({
      data: {
        conversation: { connect: { id: conversationId } },
        account: { connect: { id: options.accountId } },
        direction: MessageDirection.outbound,
        content: typeof options.content === 'string' ? options.content : JSON.stringify(options.content),
        status: MessageStatus.pending,
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
   * Actually send the WhatsApp message via API (called by queue processor)
   */
  async sendMessageNow(
    integrationId: string,
    messageId: string,
    to: string,
    type: string,
    content: any,
  ): Promise<void> {
    const config = await this.getClientConfig(integrationId);

    try {
      let messagePayload: any;

      switch (type) {
        case 'text':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: content },
          };
          break;

        case 'image':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'image',
            image: { link: content.url, caption: content.caption },
          };
          break;

        case 'video':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'video',
            video: { link: content.url, caption: content.caption },
          };
          break;

        case 'document':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'document',
            document: { link: content.url, caption: content.caption },
          };
          break;

        case 'audio':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'audio',
            audio: { link: content.url },
          };
          break;

        case 'template':
          messagePayload = {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: content.templateName,
              language: { code: content.language },
              components: content.components,
            },
          };
          break;

        default:
          throw new Error(`Unsupported message type: ${type}`);
      }

      // Send via WhatsApp Cloud API
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`WhatsApp API error: ${error}`);
      }

      const result = await response.json();

      // Update message with external ID
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          externalId: result.messages?.[0]?.id,
          status: MessageStatus.sent,
          sentAt: new Date(),
        },
      });

      this.logger.log(`WhatsApp message sent: ${messageId} -> ${result.messages?.[0]?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message ${messageId}:`, error);

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.failed },
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

      const updateData: any = {
        status: this.mapWhatsAppStatus(messageStatus),
      };

      if (messageStatus === 'delivered') {
        updateData.deliveredAt = new Date(parseInt(timestamp) * 1000);
      }
      if (messageStatus === 'read') {
        updateData.readAt = new Date(parseInt(timestamp) * 1000);
      }

      await this.prisma.message.updateMany({
        where: { externalId: id },
        data: updateData,
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

      // Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          accountId,
          channel: InteractionChannel.whatsapp,
          metadata: {
            path: ['phone'],
            equals: from,
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            account: { connect: { id: accountId } },
            channel: InteractionChannel.whatsapp,
            status: ConversationStatus.open,
            metadata: {
              phone: from,
              contact: contacts?.[0],
            },
          },
        });
      }

      // Extract message content
      let content = '';
      let mediaId: string | null = null;

      switch (type) {
        case 'text':
          content = msg.text?.body || '';
          break;
        case 'image':
          content = msg.image?.caption || '[Image]';
          mediaId = msg.image?.id;
          break;
        case 'video':
          content = msg.video?.caption || '[Video]';
          mediaId = msg.video?.id;
          break;
        case 'document':
          content = msg.document?.filename || '[Document]';
          mediaId = msg.document?.id;
          break;
        case 'audio':
          content = '[Audio]';
          mediaId = msg.audio?.id;
          break;
        default:
          content = `[${type}]`;
      }

      // Create message record
      const message = await this.prisma.message.create({
        data: {
          conversation: { connect: { id: conversation.id } },
          account: { connect: { id: accountId } },
          externalId: id,
          direction: MessageDirection.inbound,
          content,
          metadata: {
            type,
            from: contacts?.[0],
            mediaId,
            timestamp: parseInt(timestamp),
          },
          status: MessageStatus.delivered,
        },
      });

      // Download media if present
      if (mediaId) {
        await this.downloadMedia(accountId, integrationId, mediaId, message.id);
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
      const config = await this.getClientConfig(integrationId);

      // Get media URL from WhatsApp API
      const mediaInfoResponse = await fetch(
        `https://graph.facebook.com/v17.0/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        },
      );

      if (!mediaInfoResponse.ok) {
        throw new Error(`Failed to get media info: ${mediaInfoResponse.statusText}`);
      }

      const mediaInfo = await mediaInfoResponse.json();

      // Download media
      const response = await fetch(mediaInfo.url, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download media: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload to S3
      const extension = mediaInfo.mime_type?.split('/')[1] || 'bin';
      const storageKey = this.storageService.generateKey(
        accountId,
        'whatsapp-media',
        `${mediaId}.${extension}`,
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
          name: `${mediaId}.${extension}`,
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
          mediaFileId: mediaFile.id,
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
    switch (status) {
      case 'sent':
        return MessageStatus.sent;
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      case 'failed':
        return MessageStatus.failed;
      default:
        return MessageStatus.sent;
    }
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
