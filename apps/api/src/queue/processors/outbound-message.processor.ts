import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
import { InteractionChannel, MessageStatus } from '@prisma/client';
import { TelegramService } from '../../telegram/telegram.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';

export interface OutboundMessageJobData {
  conversationId: string;
  messageId: string;
  accountId: string;
  integrationId?: string;
  channel: InteractionChannel;
  content: string;
  mediaFileId?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  recipient: string;
  businessConnectionId?: string;
}

@Processor('outbound-messages')
export class OutboundMessageProcessor {
  private readonly logger = new Logger(OutboundMessageProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @Inject(forwardRef(() => WhatsAppService))
    private whatsappService: WhatsAppService,
  ) {}

  @Process()
  async sendMessage(job: Job<OutboundMessageJobData>) {
    const { messageId, channel, content, recipient } = job.data;
    this.logger.log(`Sending message ${messageId} via ${channel} to ${recipient}`);

    try {
      let result;

      switch (channel) {
        case InteractionChannel.telegram:
          result = await this.sendTelegramMessage(job.data);
          break;
        case InteractionChannel.whatsapp:
          result = await this.sendWhatsAppMessage(job.data);
          break;
        case InteractionChannel.email:
          result = await this.sendEmailMessage(job.data);
          break;
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Update message status
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          status: MessageStatus.sent,
          externalId: result.externalId,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Successfully sent message ${messageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message ${messageId}:`, error);

      // Update message status to failed
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          status: MessageStatus.failed,
          metadata: {
            error: (error as Error).message,
            attemptsMade: job.attemptsMade,
          },
        },
      });

      throw error;
    }
  }

  private async sendTelegramMessage(data: OutboundMessageJobData) {
    this.logger.log(`Sending Telegram message to ${data.recipient}`);

    // Get integration
    let integrationId = data.integrationId;
    if (!integrationId) {
      const integration = await this.prisma.integration.findFirst({
        where: { accountId: data.accountId, channel: 'telegram', status: 'active' },
      });
      if (!integration) {
        throw new Error('No active Telegram integration found');
      }
      integrationId = integration.id;
    }

    // Send message via Telegram service
    const result = await this.telegramService.sendMessage(
      integrationId,
      data.recipient,
      { text: data.content, businessConnectionId: data.businessConnectionId }
    );

    return {
      externalId: result.messageId || `tg_${Date.now()}`,
      success: true,
    };
  }

  private async sendWhatsAppMessage(data: OutboundMessageJobData) {
    this.logger.log(`Sending WhatsApp message to ${data.recipient}`);

    // Determine message type
    let type: 'text' | 'image' | 'video' | 'document' | 'audio' = 'text';
    let content: string | { url: string; caption?: string } = data.content;

    if (data.mediaFileId && data.mediaType) {
      type = data.mediaType as any;
      // In real implementation, get media URL from mediaFileId
      content = { url: data.mediaFileId, caption: data.content };
    }

    // Send message via WhatsApp service
    const result = await this.whatsappService.sendMessage({
      accountId: data.accountId,
      to: data.recipient,
      type,
      content,
    });

    return {
      externalId: result.messageId || `wa_${Date.now()}`,
      success: true,
    };
  }

  private async sendEmailMessage(data: OutboundMessageJobData) {
    this.logger.log(`Sending email to ${data.recipient}`);

    // Email implementation would use nodemailer or similar
    // For now, log and return placeholder
    this.logger.warn('Email sending not yet implemented');

    return {
      externalId: `email_${Date.now()}`,
      success: true,
    };
  }
}
