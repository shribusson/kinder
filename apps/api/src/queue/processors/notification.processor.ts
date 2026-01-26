import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
import { TelegramService } from '../../telegram/telegram.service';

export interface NotificationJobData {
  type: 'telegram' | 'email' | 'push' | 'sms' | 'new_message' | 'new_lead' | 'incoming_call';
  accountId: string;
  recipients: string[];
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}

  @Process()
  async sendNotification(job: Job<NotificationJobData>) {
    const { type, message, accountId } = job.data;
    this.logger.log(`Processing ${type} notification for account ${accountId}`);

    try {
      switch (type) {
        case 'telegram':
          return this.sendTelegramNotification(job.data);
        case 'email':
          return this.sendEmailNotification(job.data);
        case 'push':
          return this.sendPushNotification(job.data);
        case 'sms':
          return this.sendSmsNotification(job.data);
        case 'new_message':
        case 'new_lead':
        case 'incoming_call':
          return this.sendManagerNotification(job.data);
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  private async sendManagerNotification(data: NotificationJobData) {
    const { accountId, message, type } = data;

    // Get Telegram integration for manager notifications
    const integration = await this.prisma.integration.findFirst({
      where: {
        accountId,
        channel: 'telegram',
        status: 'active',
      },
    });

    if (!integration) {
      this.logger.warn(`No active Telegram integration for account ${accountId}`);
      return { success: false, reason: 'No Telegram integration' };
    }

    const settings = integration.settings as any;
    const managerChatId = settings?.managerGroupId || process.env.TELEGRAM_MANAGER_CHAT_ID;

    if (!managerChatId) {
      this.logger.warn('No manager chat ID configured');
      return { success: false, reason: 'No manager chat ID' };
    }

    try {
      await this.telegramService.notifyManagers(integration.id, message, {
        parseMode: 'Markdown',
      });
      this.logger.log(`Manager notification sent: ${type}`);
      return { success: true, sent: 1 };
    } catch (error) {
      this.logger.error('Failed to send manager notification:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async sendTelegramNotification(data: NotificationJobData) {
    const { accountId, recipients, message } = data;
    this.logger.log(`Sending Telegram notification: ${message.substring(0, 50)}...`);

    if (!recipients.length) {
      return this.sendManagerNotification(data);
    }

    const integration = await this.prisma.integration.findFirst({
      where: { accountId, channel: 'telegram', status: 'active' },
    });

    if (!integration) {
      return { success: false, reason: 'No Telegram integration' };
    }

    let sent = 0;
    for (const recipient of recipients) {
      try {
        await this.telegramService.sendMessage(integration.id, recipient, { text: message });
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send to ${recipient}:`, error);
      }
    }

    return { success: sent > 0, sent };
  }

  private async sendEmailNotification(data: NotificationJobData) {
    const { recipients, subject, message } = data;
    this.logger.log(`Sending email notification: ${subject}`);

    // Email implementation using nodemailer or similar
    // For now, just log the notification
    for (const email of recipients) {
      this.logger.log(`Would send email to ${email}: ${subject}`);
    }

    return { success: true, sent: recipients.length };
  }

  private async sendPushNotification(data: NotificationJobData) {
    this.logger.log(`Sending push notification: ${data.message.substring(0, 50)}...`);
    // Web Push or mobile push implementation
    return { success: true, sent: data.recipients.length };
  }

  private async sendSmsNotification(data: NotificationJobData) {
    this.logger.log(`Sending SMS notification: ${data.message.substring(0, 50)}...`);
    // SMS gateway implementation (e.g., Twilio, SMS.ru)
    return { success: true, sent: data.recipients.length };
  }
}
