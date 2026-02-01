import { Process, Processor } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PrismaService } from '../../prisma.service';
import { InteractionChannel, WebhookStatus, MessageDirection, MessageStatus, CallDirection, CallStatus, ConversationStatus } from '@prisma/client';
import { QUEUE_NAMES } from '../queue.constants';
import { NotificationJobData } from './notification.processor';

export interface WebhookJobData {
  webhookEventId: string;
  channel: InteractionChannel;
  payload: any;
  attempt?: number;
}

@Processor('webhooks')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationsQueue: Queue<NotificationJobData>,
  ) {}

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

    const accountId = payload.accountId;
    const integrationId = payload.integrationId;

    if (!accountId) {
      this.logger.warn('No accountId in Telegram payload');
      return;
    }

    // Extract message data
    const message = payload.message || payload.edited_message;
    if (!message) {
      this.logger.warn('No message in Telegram payload');
      return;
    }

    const chatId = String(message.chat.id);
    const text = message.text || '';
    const from = message.from;
    const firstName = from?.first_name || '';
    const lastName = from?.last_name || '';
    const username = from?.username || '';
    const fullName = `${firstName} ${lastName}`.trim() || username || chatId;

    // Find or create conversation by metadata.chatId
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
            integrationId,
            username,
            firstName,
            lastName,
            chatType: message.chat.type,
          },
        },
      });
      this.logger.log(`Created new Telegram conversation: ${conversation.id}`);
    }

    // Create message record
    const messageRecord = await this.prisma.message.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        account: { connect: { id: accountId } },
        direction: MessageDirection.inbound,
        content: text,
        externalId: String(message.message_id),
        status: MessageStatus.delivered,
        metadata: {
          from: from,
          date: message.date,
          chatId,
        },
      },
    });

    // Try to link to existing lead by username or phone
    await this.linkConversationToLead(accountId, conversation.id, { username, phone: null, name: fullName });

    // Send notification to managers
    await this.notificationsQueue.add({
      type: 'new_message',
      accountId,
      message: `📩 Новое сообщение в Telegram от ${fullName}:\n${text.substring(0, 200)}`,
      recipients: [],
      metadata: {
        conversationId: conversation.id,
        messageId: messageRecord.id,
        channel: 'telegram',
      },
    });

    this.logger.log(`Telegram message saved: ${messageRecord.id} from ${fullName}`);
  }

  private async processWhatsAppWebhook(payload: any) {
    this.logger.debug('Processing WhatsApp webhook', payload);

    const accountId = payload.accountId;
    const integrationId = payload.integrationId;

    if (!accountId) {
      this.logger.warn('No accountId in WhatsApp payload');
      return;
    }

    // WhatsApp Business API structure
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Process incoming messages
    if (value?.messages) {
      for (const message of value.messages) {
        const phone = message.from;
        const text = message.text?.body || '';
        const messageType = message.type;
        const contact = value.contacts?.[0];
        const profileName = contact?.profile?.name || phone;

        // Find or create conversation by metadata.phone
        let conversation = await this.prisma.conversation.findFirst({
          where: {
            accountId,
            channel: InteractionChannel.whatsapp,
            metadata: {
              path: ['phone'],
              equals: phone,
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
                phone,
                integrationId,
                profileName,
                waId: contact?.wa_id,
              },
            },
          });
          this.logger.log(`Created new WhatsApp conversation: ${conversation.id}`);
        }

        // Determine content based on message type
        let content = text;
        let mediaUrl: string | null = null;

        if (messageType === 'image' || messageType === 'video' || messageType === 'audio' || messageType === 'document') {
          mediaUrl = message[messageType]?.id;
          content = message[messageType]?.caption || `[${messageType}]`;
        }

        // Create message record
        const messageRecord = await this.prisma.message.create({
          data: {
            conversation: { connect: { id: conversation.id } },
            account: { connect: { id: accountId } },
            direction: MessageDirection.inbound,
            content,
            externalId: message.id,
            status: MessageStatus.delivered,
            metadata: {
              type: messageType,
              timestamp: message.timestamp,
              mediaId: mediaUrl,
              phone,
            },
          },
        });

        // Link to lead by phone
        await this.linkConversationToLead(accountId, conversation.id, { phone, name: profileName, username: null });

        // Send notification
        await this.notificationsQueue.add({
          type: 'new_message',
          accountId,
          message: `📱 Новое сообщение в WhatsApp от ${profileName}:\n${content.substring(0, 200)}`,
          recipients: [],
          metadata: {
            conversationId: conversation.id,
            messageId: messageRecord.id,
            channel: 'whatsapp',
          },
        });

        this.logger.log(`WhatsApp message saved: ${messageRecord.id} from ${phone}`);
      }
    }

    // Process status updates
    if (value?.statuses) {
      for (const status of value.statuses) {
        const externalId = status.id;
        const newStatus = this.mapWhatsAppStatus(status.status);

        await this.prisma.message.updateMany({
          where: { externalId },
          data: { status: newStatus },
        });

        this.logger.log(`WhatsApp status update: ${externalId} -> ${status.status}`);
      }
    }
  }

  private mapWhatsAppStatus(waStatus: string): MessageStatus {
    switch (waStatus) {
      case 'sent':
        return MessageStatus.sent;
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      case 'failed':
        return MessageStatus.failed;
      default:
        return MessageStatus.pending;
    }
  }

  private async processTelephonyWebhook(payload: any) {
    this.logger.debug('Processing telephony webhook', payload);

    const accountId = payload.accountId;
    const integrationId = payload.integrationId;

    if (!accountId) {
      this.logger.warn('No accountId in Telephony payload');
      return;
    }

    const eventType = payload.event || payload.type;
    const externalCallId = payload.call_id || payload.callId || payload.channel;
    const callerNumber = payload.caller || payload.from || payload.callerNumber;
    const calleeNumber = payload.callee || payload.to || payload.calleeNumber;
    const direction = payload.direction === 'outbound' ? CallDirection.outbound : CallDirection.inbound;
    const phoneNumber = direction === CallDirection.inbound ? callerNumber : calleeNumber;

    // Map event type to call status
    let status: CallStatus;
    switch (eventType) {
      case 'initiated':
      case 'StasisStart':
        status = CallStatus.initiated;
        break;
      case 'ringing':
      case 'Ringing':
        status = CallStatus.ringing;
        break;
      case 'answered':
      case 'Up':
        status = CallStatus.answered;
        break;
      case 'completed':
      case 'StasisEnd':
      case 'Hangup':
        status = CallStatus.completed;
        break;
      case 'busy':
        status = CallStatus.failed;
        break;
      case 'failed':
      case 'no-answer':
        status = CallStatus.failed;
        break;
      default:
        status = CallStatus.initiated;
    }

    // Find existing call by metadata.externalId or create new one
    let call = await this.prisma.call.findFirst({
      where: {
        accountId,
        metadata: {
          path: ['externalId'],
          equals: externalCallId,
        },
      },
    });

    if (!call) {
      // Create new call record
      call = await this.prisma.call.create({
        data: {
          account: { connect: { id: accountId } },
          direction,
          status,
          phoneNumber: phoneNumber || 'unknown',
          startedAt: new Date(),
          metadata: {
            externalId: externalCallId,
            integrationId,
            eventType,
            callerNumber,
            calleeNumber,
          },
        },
      });
      this.logger.log(`Created new call record: ${call.id}`);

      // Link to lead by phone
      if (phoneNumber) {
        await this.linkCallToLead(accountId, call.id, phoneNumber);
      }

      // Send notification for incoming calls
      if (direction === CallDirection.inbound) {
        await this.notificationsQueue.add({
          type: 'incoming_call',
          accountId,
          message: `📞 Входящий звонок от ${callerNumber || 'неизвестный номер'}`,
          recipients: [],
          metadata: {
            callId: call.id,
            callerNumber,
            channel: 'telephony',
          },
        });
      }
    } else {
      // Update existing call
      const updateData: any = { status };

      if (status === CallStatus.completed) {
        updateData.endedAt = new Date();
        if (call.startedAt) {
          updateData.duration = Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000);
        }
      }

      call = await this.prisma.call.update({
        where: { id: call.id },
        data: updateData,
      });
      this.logger.log(`Updated call ${call.id}: status -> ${status}`);
    }

    // Handle call recording
    if (payload.recording_url || payload.recordingUrl) {
      await this.prisma.callRecording.create({
        data: {
          call: { connect: { id: call.id } },
          url: payload.recording_url || payload.recordingUrl,
          duration: payload.recording_duration || 0,
        },
      });
      this.logger.log(`Saved call recording for call ${call.id}`);
    }

    this.logger.log(`Telephony event processed: ${eventType} for call ${externalCallId}`);
  }

  private async linkCallToLead(accountId: string, callId: string, phone: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        accountId,
        phone: { contains: phone.replace(/\D/g, '').slice(-10) },
      },
    });

    if (lead) {
      await this.prisma.call.update({
        where: { id: callId },
        data: { leadId: lead.id },
      });
      this.logger.log(`Linked call ${callId} to lead ${lead.id}`);
    }
  }

  private async processWebsiteWebhook(payload: any) {
    this.logger.debug('Processing website webhook', payload);

    const accountId = payload.accountId;
    const { name, phone, email, source } = payload;

    if (!accountId) {
      this.logger.warn('No accountId in website payload');
      return;
    }

    if (name && source) {
      this.logger.log(`Website lead: ${name} from ${source}`);

      // Send notification to managers about new lead
      await this.notificationsQueue.add({
        type: 'new_lead',
        accountId,
        message: `🎯 Новая заявка с сайта!\n\n👤 ${name}\n📞 ${phone || 'не указан'}\n📧 ${email || 'не указан'}\n📍 Источник: ${source}`,
        recipients: [],
        metadata: {
          name,
          phone,
          email,
          source,
          channel: 'website',
        },
      });
    }
  }

  private async linkConversationToLead(
    accountId: string,
    conversationId: string,
    contact: { phone: string | null; username: string | null; name: string }
  ) {
    // Try to find lead by phone or create a new one
    let lead = null;

    if (contact.phone) {
      const normalizedPhone = contact.phone.replace(/\D/g, '').slice(-10);
      lead = await this.prisma.lead.findFirst({
        where: {
          accountId,
          phone: { contains: normalizedPhone },
        },
      });
    }

    if (!lead && contact.username) {
      // Try to find by metadata containing username
      lead = await this.prisma.lead.findFirst({
        where: {
          accountId,
          metadata: {
            path: ['telegram_username'],
            equals: contact.username,
          },
        },
      });
    }

    if (lead) {
      // Link conversation to existing lead
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lead: { connect: { id: lead.id } } },
      });
      this.logger.log(`Linked conversation ${conversationId} to lead ${lead.id}`);
    } else {
      this.logger.debug(`No matching lead found for conversation ${conversationId}`);
    }
  }
}
