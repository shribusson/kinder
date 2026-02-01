import { Request } from 'express';
import { User, UserRole } from '@prisma/client';

/**
 * JWT payload structure from auth tokens
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  accountId: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated request with JWT payload attached (for JwtAuthGuard)
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Request after LocalAuthGuard validation (login endpoint)
 * LocalAuthGuard attaches the full User object, not JwtPayload
 */
export interface LocalAuthRequest extends Request {
  user: User;
}

/**
 * Socket data structure for WebSocket connections
 */
export interface SocketUserData {
  user: JwtPayload;
}

/**
 * Webhook payload types for integration services
 */
export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'sticker' | 'location' | 'contacts';
        text?: { body: string };
        image?: { id: string; caption?: string };
        video?: { id: string; caption?: string };
        document?: { id: string; filename?: string; caption?: string };
        audio?: { id: string };
      }>;
      statuses?: Array<{
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
        recipient_id: string;
        errors?: Array<{ code: number; title: string }>;
      }>;
    };
  }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

/**
 * Telegram update types
 */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: Array<{ file_id: string; width: number; height: number }>;
  video?: { file_id: string; duration: number };
  document?: { file_id: string; file_name?: string };
  voice?: { file_id: string; duration: number };
  audio?: { file_id: string; duration: number; title?: string };
  caption?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
  };
}

/**
 * API response types
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
