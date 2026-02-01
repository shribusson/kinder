export const QUEUE_NAMES = {
  WEBHOOKS: 'webhooks',
  OUTBOUND_MESSAGES: 'outbound-messages',
  CALLS: 'calls',
  MEDIA_PROCESSING: 'media-processing',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];
