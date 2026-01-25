# Schema Migration Plan

## Current Status

**✅ Core CRM**: Working (auth, leads, deals, campaigns, analytics, bookings)
**✅ Infrastructure**: Docker Compose with 11 services configured
**✅ Storage**: MinIO integration complete
**✅ Queues**: Redis + Bull with 6 queues
**✅ Unified Inbox**: Backend complete (Conversations, Messages, WebSocket gateway)

**🔄 Channel Integrations**: Code complete but **temporarily disabled** due to schema mismatches

## Schema Mismatches

The channel integration code (Telephony, WhatsApp, Telegram) was built expecting a more detailed schema than what exists. Here are the key mismatches:

### Call Model
**Expected by code:**
- `from: string` - caller number
- `to: string` - callee number  
- `externalId: string` - Asterisk channel ID
- `conversationId: string` - link to conversation
- `channelId: string` - Asterisk channel identifier

**Current schema:**
```prisma
model Call {
  id          String
  accountId   String
  leadId      String?
  direction   CallDirection
  phoneNumber String          // Single phone field
  status      CallStatus
  duration    Int?
  recordingId String?
  startedAt   DateTime
  endedAt     DateTime?
}
```

### MediaFile Model  
**Expected:** `name: string` (filename)
**Current:** `key: string` (S3 key)

### Message Model
**Expected:** `mediaFiles: MediaFile[]` (multiple)
**Current:** `mediaFile?: MediaFile` (singular relation)

### Integration Model
**Expected:** Compound unique index `@@unique([accountId, integrationId, externalId])`
**Current:** Simple `@id` primary key

### Enum Values
**Expected:** UPPERCASE strings ('WHATSAPP', 'TELEGRAM')
**Current:** lowercase enum values ('whatsapp', 'telegram', 'telephony')

## Migration Options

### Option 1: Extend Schema (Recommended)
Add missing fields to support full channel functionality:

```prisma
model Call {
  id             String        @id @default(uuid())
  accountId      String
  leadId         String?
  conversationId String?       // NEW: Link to conversation
  direction      CallDirection
  from           String        // NEW: Caller number
  to             String        // NEW: Callee number
  phoneNumber    String        // Keep for backwards compat
  externalId     String?       // NEW: Channel/call ID from provider
  status         CallStatus
  duration       Int?
  recordingId    String?
  metadata       Json?
  startedAt      DateTime
  endedAt        DateTime?
  createdAt      DateTime      @default(now())

  account        Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  lead           Lead?           @relation(fields: [leadId], references: [id], onDelete: SetNull)
  conversation   Conversation?   @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  recording      CallRecording?

  @@index([externalId])         // NEW: Fast lookups by provider ID
  @@index([conversationId])     // NEW
}

model MediaFile {
  id        String   @id @default(uuid())
  accountId String
  name      String                // NEW: Original filename
  url       String
  bucket    String
  key       String                // S3 key path
  mimeType  String
  size      Int
  metadata  Json?
  uploadedAt DateTime @default(now())

  account        Account         @relation(fields: [accountId], references: [id], onDelete: Cascade)
  message        Message?        @relation(fields: [messageId], references: [id])
  messageId      String?         // NEW: Direct relation
  callRecordings CallRecording[]
  contentItems   ContentItem[]
}

model Message {
  id             String          @id @default(uuid())
  accountId      String
  conversationId String
  direction      MessageDirection
  content        String?
  mediaFileIds   String[]        // NEW: Multiple media files
  status         MessageStatus   @default(pending)
  externalId     String?
  metadata       Json?
  sentAt         DateTime?
  deliveredAt    DateTime?
  readAt         DateTime?
  createdAt      DateTime        @default(now())

  account      Account      @relation(fields: [accountId], references: [id], onDelete: Cascade)
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  mediaFiles   MediaFile[]  // NEW: Support multiple attachments

  @@index([externalId])
}
```

### Option 2: Simplify Code (Faster, temporary)
Adapt channel integration code to current schema:
- Use `phoneNumber` instead of separate `from`/`to`
- Store call metadata in `metadata` JSON field
- Use `key` for file storage instead of `name`
- Single media file per message

## Recommended Steps

1. **Now** (Get Docker Running):
   - ✅ Channel modules disabled in app.module.ts
   - 🔄 Docker building without type errors
   - Start services: `docker compose up -d`
   - Run migrations: `cd apps/api && npx prisma migrate dev`
   - Create admin user: `npm run seed`

2. **Short Term** (Schema Migration):
   - Create migration adding fields to Call, MediaFile models
   - Re-enable Telephony/WhatsApp/Telegram modules
   - Test each channel integration

3. **Next Features**:
   - Unified Inbox Frontend
   - Client Portal  
   - Billing Integration

## Commands

```bash
# Start services
docker compose up -d

# Check logs
docker compose logs -f api

# Run migration
docker compose exec api npx prisma migrate dev --name add_channel_fields

# Create admin user
docker compose exec api npm run seed

# Restart after code changes
docker compose restart api web
```

## Current Build Status

Building Docker containers with:
- **API**: Core CRM + Storage + Queues + Conversations ✅
- **Web**: Next.js frontend ✅
- **Infrastructure**: Postgres, Redis, MinIO, Asterisk, Monitoring ✅
- **Channels**: Temporarily disabled (code complete, needs schema) 🔄
