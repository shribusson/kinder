import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma.module';
// TODO: Re-enable after schema migration
// import { TelephonyModule } from '../telephony/telephony.module';
import { WebhookProcessor } from './processors/webhook.processor';
import { OutboundMessageProcessor } from './processors/outbound-message.processor';
import { CallProcessor } from './processors/call.processor';
import { MediaProcessor } from './processors/media.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { NotificationProcessor } from './processors/notification.processor';

export const QUEUE_NAMES = {
  WEBHOOKS: 'webhooks',
  OUTBOUND_MESSAGES: 'outbound-messages',
  CALLS: 'calls',
  MEDIA_PROCESSING: 'media-processing',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
} as const;

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.WEBHOOKS },
      { name: QUEUE_NAMES.OUTBOUND_MESSAGES },
      { name: QUEUE_NAMES.CALLS },
      { name: QUEUE_NAMES.MEDIA_PROCESSING },
      { name: QUEUE_NAMES.ANALYTICS },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
    PrismaModule,
    // TelephonyModule,  // Disabled - needs schema migration
  ],
  providers: [
    WebhookProcessor,
    OutboundMessageProcessor,
    CallProcessor,
    MediaProcessor,
    AnalyticsProcessor,
    NotificationProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
