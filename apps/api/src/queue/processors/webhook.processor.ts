import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
import { InteractionChannel, WebhookStatus } from '@prisma/client';

export interface WebhookJobData {
  webhookEventId: string;
  channel: InteractionChannel;
  payload: any;
  attempt?: number;
}

@Processor('webhooks')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process()
  async processWebhook(job: Job<WebhookJobData>) {
    const { webhookEventId, channel, payload } = job.data;
    this.logger.log(`Processing webhook ${webhookEventId} from ${channel}`);

    try {
      // Process based on channel type
      switch (channel) {
        case InteractionChannel.telegram:
          await this.processTelegramWebhook(payload);
          break;
        case InteractionChannel.whatsapp:
          await this.processWhatsAppWebhook(payload);
          break;
        case InteractionChannel.telephony:
          await this.processTelephonyWebhook(payload);
          break;
        case InteractionChannel.website:
          await this.processWebsiteWebhook(payload);
          break;
        default:
          this.logger.warn(`Unknown channel: ${channel}`);
      }

      // Update webhook status to processed
      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: WebhookStatus.processed,
          attempts: job.attemptsMade,
        },
      });

      this.logger.log(`Successfully processed webhook ${webhookEventId}`);
    } catch (error) {
      this.logger.error(`Failed to process webhook ${webhookEventId}:`, error);

      // Update webhook status to failed
      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: WebhookStatus.failed,
          attempts: job.attemptsMade,
          lastError: (error as Error).message,
        },
      });

      throw error; // Re-throw to trigger Bull retry
    }
  }

  private async processTelegramWebhook(payload: any) {
    this.logger.debug('Processing Telegram webhook', payload);
    
    // Extract message data
    const message = payload.message || payload.edited_message;
    if (!message) {
      this.logger.warn('No message in Telegram payload');
      return;
    }

    const chatId = message.chat.id;
    const text = message.text || '';
    const from = message.from;

    // TODO: Create or update conversation
    // TODO: Create message record
    // TODO: Link to lead if exists
    
    this.logger.log(`Telegram message from ${from.username}: ${text}`);
  }

  private async processWhatsAppWebhook(payload: any) {
    this.logger.debug('Processing WhatsApp webhook', payload);
    
    // WhatsApp Business API structure
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      for (const message of value.messages) {
        this.logger.log(`WhatsApp message from ${message.from}: ${message.text?.body || '[media]'}`);
        
        // TODO: Create or update conversation
        // TODO: Create message record
        // TODO: Download media if present
        // TODO: Link to lead
      }
    }

    if (value?.statuses) {
      for (const status of value.statuses) {
        this.logger.log(`WhatsApp status update: ${status.id} -> ${status.status}`);
        
        // TODO: Update message status
      }
    }
  }

  private async processTelephonyWebhook(payload: any) {
    this.logger.debug('Processing telephony webhook', payload);
    
    const eventType = payload.event || payload.type;
    const callId = payload.call_id || payload.callId;

    this.logger.log(`Telephony event: ${eventType} for call ${callId}`);
    
    // TODO: Create or update call record
    // TODO: Handle call states (initiated, ringing, answered, completed)
    // TODO: Process call recordings
  }

  private async processWebsiteWebhook(payload: any) {
    this.logger.debug('Processing website webhook', payload);
    
    // This is for website lead forms
    const { name, phone, email, source, utm } = payload;

    if (name && source) {
      this.logger.log(`Website lead: ${name} from ${source}`);
      
      // TODO: Create lead record (this is already partially implemented in integrations.controller)
      // TODO: Create interaction record
      // TODO: Send notification to managers
    }
  }
}
