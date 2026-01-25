import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
import { InteractionChannel, MessageStatus } from '@prisma/client';

export interface OutboundMessageJobData {
  conversationId: string;
  messageId: string;
  channel: InteractionChannel;
  content: string;
  mediaFileId?: string;
  recipient: string;
}

@Processor('outbound-messages')
export class OutboundMessageProcessor {
  private readonly logger = new Logger(OutboundMessageProcessor.name);

  constructor(private prisma: PrismaService) {}

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
    // TODO: Implement Telegram sending via bot API
    this.logger.log(`Sending Telegram message to ${data.recipient}`);
    
    // Placeholder - will be implemented when Telegram module is ready
    return {
      externalId: `tg_${Date.now()}`,
      success: true,
    };
  }

  private async sendWhatsAppMessage(data: OutboundMessageJobData) {
    // TODO: Implement WhatsApp sending via WABA API
    this.logger.log(`Sending WhatsApp message to ${data.recipient}`);
    
    // Placeholder - will be implemented when WABA module is ready
    return {
      externalId: `wa_${Date.now()}`,
      success: true,
    };
  }

  private async sendEmailMessage(data: OutboundMessageJobData) {
    // TODO: Implement email sending via SMTP
    this.logger.log(`Sending email to ${data.recipient}`);
    
    // Placeholder
    return {
      externalId: `email_${Date.now()}`,
      success: true,
    };
  }
}
