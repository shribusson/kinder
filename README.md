# Kinder CRM — Production-Ready Platform

**Enterprise-grade CRM + Client Portal + Marketing Site** for child education center with full channel synchronization, billing, content delivery, and self-hosted infrastructure.

## 🚀 Quick Start (одной командой)

```bash
# Клонировать репозиторий
git clone git@github.com:shribusson/kinder.git
cd kinder

# Запустить все сервисы
docker compose up -d

# Проверить статус
docker compose ps
```

После запуска:
- **Web приложение**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **MinIO Console**: http://localhost:9001 (admin/admin123)
- **Grafana**: http://localhost:3003

## 🎯 Overview

Complete business management platform featuring:
- **Multi-tenant CRM** with unified inbox for all communication channels
- **Self-hosted infrastructure** (Asterisk, WABA, MinIO, monitoring)
- **Client portal** with billing, education content, and multi-language support
- **Manager CRM** with analytics, automation, and team collaboration
- **Full channel sync**: Telegram, WhatsApp, telephony, social media, ad platforms
- **Production monitoring**: Prometheus, Grafana, Loki, Sentry

---

## 📋 Requirements

### Development
- Node.js 20+
- npm 9+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Production (Self-Hosted)
- VPS/Dedicated server with:
  - 4+ CPU cores
  - 8+ GB RAM
  - 100+ GB SSD storage
  - Docker & Docker Compose
  - Domain with DNS access

---

## 🚀 Quick Start (Development)

### 1. Clone and Install
\`\`\`bash
git clone <repository>
cd kinder
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 3. Start Infrastructure
\`\`\`bash
docker compose up -d postgres redis minio
\`\`\`

### 4. Database Migration
\`\`\`bash
cd apps/api
npx prisma generate
npx prisma migrate dev
\`\`\`

### 5. Seed Initial Data (Optional)
\`\`\`bash
npm run seed  # Creates default account and admin user
\`\`\`

### 6. Start Development Servers
\`\`\`bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Web
npm run dev:web
\`\`\`

### 7. Access Applications
- **Marketing Site**: http://localhost:3000
- **CRM Dashboard**: http://localhost:3000/crm
- **Client Portal**: http://localhost:3000/client/ru
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **MinIO Console**: http://localhost:9001

---

## 🐳 Production Deployment

### Full Stack with Monitoring

\`\`\`bash
# 1. Configure production environment
cp .env.example .env
# Edit .env with production values

# 2. Start all services
docker compose up -d

# 3. Run database migrations
docker exec kinder_api npx prisma migrate deploy

# 4. Create initial admin user
docker exec -it kinder_api npm run seed

# 5. Verify all services
docker compose ps
\`\`\`

### Service URLs (Production)
- **Main Site**: https://kinder.kz
- **CRM**: https://crm.kinder.kz
- **Client Portal**: https://client.kinder.kz
- **API**: https://api.kinder.kz
- **Grafana**: https://grafana.kinder.kz
- **MinIO Console**: https://minio.kinder.kz:9001

---

## 📦 Architecture

### Services
- **API (NestJS)**: REST API, WebSocket, job queues
- **Web (Next.js 14)**: Marketing site, CRM UI, client portal
- **PostgreSQL**: Primary database
- **Redis**: Caching, job queues (Bull)
- **MinIO**: S3-compatible object storage
- **Asterisk**: VoIP telephony
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Loki + Promtail**: Log aggregation
- **Caddy**: Reverse proxy with automatic HTTPS

### Data Models (55+ tables)
- **Auth**: Account, User, Membership, Session, RefreshToken
- **CRM**: Lead, Deal, Booking, Campaign, Interaction
- **Channels**: Integration, Conversation, Message, Call, ChatSession
- **Social**: SocialAccount, AdAccount, AdCampaign, Tag
- **Billing**: Subscription, Invoice, Payment, Order
- **Education**: Product, ContentItem, AccessGrant, Webinar

---

## 🔐 Authentication & Security

### JWT-Based Authentication
- Access token: 15 minutes (configurable)
- Refresh token: 7 days (configurable)
- HTTP-only cookies for web clients
- Bearer token for API clients

### Role-Based Access Control (RBAC)
- **superadmin**: Full system access
- **admin**: Account management, all CRM features
- **manager**: CRM operations, limited settings
- **client**: Portal access only

### Security Features
- Password hashing with bcrypt
- Rate limiting (60 req/min global, 10 req/min auth)
- Helmet.js for HTTP headers
- CORS with whitelist
- Webhook signature verification
- Encrypted integration credentials
- SQL injection protection (Prisma ORM)
- XSS protection (React escape)

---

## 📞 Integrations

### Telephony (Asterisk)
- Self-hosted VoIP
- Inbound/outbound calls
- Call recording
- CDR (Call Detail Records)
- ARI integration

**Setup**:
1. Configure SIP trunks in \`asterisk/etc/sip.conf\`
2. Set \`ASTERISK_ARI_*\` env variables
3. Register phone numbers with provider

### WhatsApp Business API (WABA)
- Cloud API or on-premise
- Message templates
- Media handling (images, voice, documents)
- Status webhooks
- Signature verification

**Setup**:
1. Apply for WABA access via Meta
2. Create WhatsApp Business Account
3. Set \`WABA_*\` env variables
4. Configure webhook URL: \`https://api.kinder.kz/crm/integrations/whatsapp/webhook\`

### Telegram Bot
- Built-in bot for client inquiries
- Manager notifications in group
- Commands: /stats, /leads, /today
- Media handling
- Inline keyboards

**Setup**:
1. Create bot via @BotFather
2. Set \`TELEGRAM_BOT_TOKEN\`
3. Add bot to manager group, get chat ID
4. Set webhook: \`https://api.kinder.kz/crm/integrations/telegram/webhook\`

### Social Media
- **Meta** (Instagram, Facebook): DMs, comments, lead ads
- **VK**: Messages, comments, leads
- **TikTok**: Messages (upcoming)

### Ad Platforms
- **Meta Ads**: Campaign sync, spend, conversions
- **Google Ads**: Campaign performance
- **Yandex.Direct**: Spend and statistics
- **VK Ads**: Campaign data
- **TikTok Ads**: Performance metrics

---

## 💳 Billing & Payments

### Supported Providers
- **CloudPayments** (primary, RU/KZ)
- **ЮKassa** (alternative, RU)
- Extendable architecture for custom gateways

### Features
- Invoice generation (PDF)
- Recurring subscriptions
- Payment webhooks
- Email notifications
- Transaction history
- Refund handling

### Setup
1. Register with payment provider
2. Set \`PAYMENT_*\` env variables
3. Configure webhook URL
4. Test in sandbox mode

---

## 📊 Monitoring & Observability

### Metrics (Prometheus + Grafana)
- HTTP request metrics (duration, status codes)
- Queue job metrics (processed, failed)
- Database query performance
- External API call tracking
- Business metrics (leads, deals, revenue)

**Access Grafana**: http://localhost:3003 (admin/admin)

### Logging (Loki + Promtail)
- Structured JSON logs (Pino)
- Request context (requestId, userId, accountId)
- Log levels: debug, info, warn, error
- Centralized aggregation

**Query logs in Grafana**: Explore → Loki

### Error Tracking (Sentry)
- Optional integration
- Set \`SENTRY_DSN\` in .env
- Automatic error reporting
- Source maps for stack traces

### Health Checks
- \`GET /health\`: Overall status
- Individual service checks:
  - PostgreSQL connection
  - Redis connection
  - MinIO availability
  - Asterisk connectivity

---

## 🔄 Backup & Recovery

### Automated Backups
Script: \`scripts/backup.sh\`

**Features**:
- PostgreSQL dump (compressed)
- MinIO data mirror
- Configurable retention (default: 7 days)
- Telegram notifications on failure

**Setup Cron Job**:
\`\`\`bash
# Daily at 2 AM
0 2 * * * /opt/kinder/scripts/backup.sh >> /var/log/kinder-backup.log 2>&1
\`\`\`

### Manual Backup
\`\`\`bash
# Database
docker exec kinder_postgres pg_dump -U postgres kinder_crm > backup.sql

# MinIO (requires mc client)
mc mirror local/kinder-media ./minio-backup
\`\`\`

### Restore
\`\`\`bash
# Database
docker exec -i kinder_postgres psql -U postgres kinder_crm < backup.sql

# MinIO
mc mirror ./minio-backup local/kinder-media
\`\`\`

---

## 🧪 Testing

### Unit Tests
\`\`\`bash
cd apps/api
npm run test
npm run test:watch
npm run test:cov
\`\`\`

### E2E Tests
\`\`\`bash
cd apps/api
npm run test:e2e
\`\`\`

### Frontend Tests
\`\`\`bash
cd apps/web
npm run test
\`\`\`

---

## 🚢 CI/CD

### GitHub Actions
- **CI** (\`.github/workflows/ci.yml\`): Lint, typecheck, tests, build
- **CD** (\`.github/workflows/deploy.yml\`): Auto-deploy to production on \`main\` push

### Manual Deployment
\`\`\`bash
# SSH to server
ssh user@kinder.kz

# Update code
cd /opt/kinder
git pull

# Rebuild and restart
docker compose up -d --build

# Run migrations
docker exec kinder_api npx prisma migrate deploy
\`\`\`

---

## 📖 API Documentation

### Authentication Endpoints
- \`POST /auth/register\`: Create new user
- \`POST /auth/login\`: Login (returns JWT tokens)
- \`POST /auth/refresh\`: Refresh access token
- \`POST /auth/logout\`: Logout (invalidate tokens)
- \`POST /auth/me\`: Get current user info

### CRM Endpoints (Protected)
- \`GET /crm/leads\`: List leads
- \`POST /crm/leads\`: Create lead
- \`GET /crm/deals\`: List deals
- \`POST /crm/deals\`: Create deal
- \`GET /crm/conversations\`: List conversations
- \`POST /crm/conversations/:id/send\`: Send message
- \`GET /crm/analytics/summary\`: Dashboard metrics
- \`GET /crm/analytics/funnel\`: Conversion funnel

### Client Portal Endpoints
- \`GET /client/profile\`: User profile
- \`GET /client/orders\`: Order history
- \`GET /client/invoices\`: Invoice list
- \`GET /client/education/products\`: Available courses/webinars
- \`POST /client/education/access\`: Request content access

**Full API docs**: See \`/api-docs\` (Swagger) after enabling in production

---

## 🌍 Internationalization (i18n)

### Client Portal
- Supported languages: Russian (ru), English (en), Kazakh (kk)
- URL structure: \`/client/{lang}/dashboard\`
- Auto-detection from browser locale
- User preference stored in profile

### Manager CRM
- Russian only
- No language switcher

### Marketing Site
- Multi-language support
- SEO-friendly URLs: \`/{lang}/\`
- Localized content and metadata

---

## 🎨 UI Components & Styling

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Custom component library
- **Icons**: Heroicons
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (global), React Query (server state)

---

## 🐛 Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs kinder_postgres

# Test connection
docker exec kinder_postgres psql -U postgres -c "SELECT 1"
\`\`\`

### API Won't Start
\`\`\`bash
# Check API logs
docker logs kinder_api

# Verify environment variables
docker exec kinder_api env | grep DATABASE_URL

# Restart API
docker compose restart api
\`\`\`

### Webhook Not Receiving Events
1. Verify webhook URL is publicly accessible
2. Check firewall rules
3. Verify webhook secret matches
4. Check API logs for webhook processing errors
5. Test webhook with curl:
\`\`\`bash
curl -X POST https://api.kinder.kz/crm/integrations/telegram/webhook \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'
\`\`\`

### MinIO Not Accessible
\`\`\`bash
# Check MinIO logs
docker logs kinder_minio

# Verify credentials
docker exec kinder_minio mc alias set local http://localhost:9000 minioadmin minioadmin

# List buckets
docker exec kinder_minio mc ls local
\`\`\`

---

## 📝 Production Checklist

### Before Going Live
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Initial admin user created
- [ ] SSL certificates configured (Caddy handles this)
- [ ] Domain DNS records set
- [ ] Firewall configured (ports 80, 443, 5060, 10000-10099)
- [ ] Backups configured and tested
- [ ] Monitoring dashboards set up
- [ ] Error tracking (Sentry) configured
- [ ] Webhook URLs configured in external services
- [ ] Telegram bot activated
- [ ] WhatsApp Business verified
- [ ] Asterisk SIP trunks configured
- [ ] Payment gateway tested (sandbox → production)
- [ ] Social media app approvals obtained
- [ ] Ad platform API access granted
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team training completed

### Post-Launch Monitoring
- [ ] Check Grafana dashboards daily
- [ ] Review error logs in Sentry
- [ ] Verify backup success notifications
- [ ] Monitor disk space usage
- [ ] Check webhook delivery rates
- [ ] Review API response times
- [ ] Monitor queue job processing

---

## 🤝 Contributing

This is a private project for a single organization. Internal contributions follow:
1. Create feature branch: \`feature/description\`
2. Make changes with tests
3. Submit PR for review
4. Merge to \`main\` after approval

---

## 📄 License

Proprietary - All rights reserved

---

## 🆘 Support

For technical issues:
- Check logs: \`docker compose logs -f\`
- Review troubleshooting section above
- Contact: dev@kinder.kz

For business inquiries:
- Website: https://kinder.kz
- Email: info@kinder.kz
- Phone: +7 (XXX) XXX-XX-XX

