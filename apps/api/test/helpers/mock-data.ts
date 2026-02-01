import { v4 as uuidv4 } from 'uuid';

/**
 * Mock data factories for testing
 * Each factory creates consistent test data with optional overrides
 */

// ============================================
// User & Auth
// ============================================

export interface MockUser {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = overrides.id || uuidv4();
  return {
    id,
    email: `user-${id.slice(0, 8)}@test.com`,
    password: '$2b$10$hashedpassword', // bcrypt hash of "password123"
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================
// Account & Membership
// ============================================

export interface MockAccount {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockAccount(overrides: Partial<MockAccount> = {}): MockAccount {
  const id = overrides.id || uuidv4();
  return {
    id,
    name: `Test Account ${id.slice(0, 8)}`,
    slug: `test-account-${id.slice(0, 8)}`,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export interface MockMembership {
  id: string;
  userId: string;
  accountId: string;
  role: 'superadmin' | 'admin' | 'manager' | 'client';
  createdAt: Date;
}

export function createMockMembership(
  userId: string,
  accountId: string,
  overrides: Partial<MockMembership> = {},
): MockMembership {
  return {
    id: uuidv4(),
    userId,
    accountId,
    role: 'manager',
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================
// Conversations & Messages
// ============================================

export type InteractionChannel = 'telegram' | 'whatsapp' | 'telephony' | 'web' | 'email';
export type ConversationStatus = 'open' | 'closed' | 'archived';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MockConversation {
  id: string;
  accountId: string;
  channel: InteractionChannel;
  externalId: string;
  status: ConversationStatus;
  assignedToUserId?: string;
  leadId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockConversation(
  accountId: string,
  overrides: Partial<MockConversation> = {},
): MockConversation {
  const id = overrides.id || uuidv4();
  return {
    id,
    accountId,
    channel: 'telegram',
    externalId: `ext-${id.slice(0, 8)}`,
    status: 'open',
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export interface MockMessage {
  id: string;
  accountId: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  status: MessageStatus;
  mediaFileId?: string;
  externalId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

export function createMockMessage(
  conversationId: string,
  accountId: string,
  overrides: Partial<MockMessage> = {},
): MockMessage {
  const id = overrides.id || uuidv4();
  return {
    id,
    accountId,
    conversationId,
    direction: 'inbound',
    content: `Test message ${id.slice(0, 8)}`,
    status: 'delivered',
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================
// CRM: Leads, Deals, Bookings
// ============================================

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
export type LeadSource = 'website' | 'telegram' | 'whatsapp' | 'phone' | 'referral' | 'other';

export interface MockLead {
  id: string;
  accountId: string;
  name: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  source: LeadSource;
  notes?: string;
  conversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockLead(
  accountId: string,
  overrides: Partial<MockLead> = {},
): MockLead {
  const id = overrides.id || uuidv4();
  return {
    id,
    accountId,
    name: `Test Lead ${id.slice(0, 8)}`,
    email: `lead-${id.slice(0, 8)}@test.com`,
    phone: '+77001234567',
    stage: 'new',
    source: 'website',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export type DealStage = 'negotiation' | 'proposal' | 'contract' | 'won' | 'lost';

export interface MockDeal {
  id: string;
  accountId: string;
  leadId: string;
  name: string;
  value: number;
  stage: DealStage;
  notes?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockDeal(
  accountId: string,
  leadId: string,
  overrides: Partial<MockDeal> = {},
): MockDeal {
  const id = overrides.id || uuidv4();
  return {
    id,
    accountId,
    leadId,
    name: `Test Deal ${id.slice(0, 8)}`,
    value: 50000,
    stage: 'negotiation',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface MockBooking {
  id: string;
  accountId: string;
  leadId?: string;
  dealId?: string;
  serviceName: string;
  scheduledAt: Date;
  duration: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockBooking(
  accountId: string,
  overrides: Partial<MockBooking> = {},
): MockBooking {
  const id = overrides.id || uuidv4();
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + 7); // Schedule for next week

  return {
    id,
    accountId,
    serviceName: 'Consultation',
    scheduledAt,
    duration: 60,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================
// Media & Files
// ============================================

export interface MockMediaFile {
  id: string;
  accountId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export function createMockMediaFile(
  accountId: string,
  overrides: Partial<MockMediaFile> = {},
): MockMediaFile {
  const id = overrides.id || uuidv4();
  return {
    id,
    accountId,
    name: `test-file-${id.slice(0, 8)}.jpg`,
    mimeType: 'image/jpeg',
    size: 1024 * 100, // 100KB
    url: `https://storage.example.com/${id}`,
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================
// Refresh Tokens
// ============================================

export interface MockRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export function createMockRefreshToken(
  userId: string,
  overrides: Partial<MockRefreshToken> = {},
): MockRefreshToken {
  const id = overrides.id || uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  return {
    id,
    userId,
    token: `refresh-token-${id}`,
    expiresAt,
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================
// Test Data Collections
// ============================================

/**
 * Creates a complete test scenario with user, account, membership, and conversation
 */
export function createTestScenario() {
  const user = createMockUser();
  const account = createMockAccount();
  const membership = createMockMembership(user.id, account.id, { role: 'admin' });
  const lead = createMockLead(account.id);
  const conversation = createMockConversation(account.id, { leadId: lead.id });
  const messages = [
    createMockMessage(conversation.id, account.id, { direction: 'inbound', content: 'Hello!' }),
    createMockMessage(conversation.id, account.id, { direction: 'outbound', content: 'Hi! How can I help?' }),
    createMockMessage(conversation.id, account.id, { direction: 'inbound', content: 'I need info about services' }),
  ];

  return {
    user,
    account,
    membership,
    lead,
    conversation,
    messages,
  };
}
