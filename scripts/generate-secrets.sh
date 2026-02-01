#!/bin/bash
# ===========================================
# Kinder CRM - Generate Production Secrets
# ===========================================

set -e

echo "======================================"
echo "  GENERATING PRODUCTION SECRETS"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate strong passwords
echo -e "${YELLOW}Generating strong passwords...${NC}"

POSTGRES_PASSWORD=$(pwgen -s 32 1)
REDIS_PASSWORD=$(pwgen -s 32 1)
MINIO_ROOT_USER="admin$(pwgen -s 12 1)"
MINIO_ROOT_PASSWORD=$(pwgen -s 32 1)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
ASTERISK_ARI_PASSWORD=$(pwgen -s 24 1)
GRAFANA_PASSWORD=$(pwgen -s 24 1)
WABA_WEBHOOK_VERIFY=$(pwgen -s 32 1)
TELEGRAM_WEBHOOK_SECRET=$(pwgen -s 32 1)

# Save credentials to secure file
cat > /opt/kinder/secrets/credentials.txt <<EOF
# ===========================================
# Kinder CRM Production Credentials
# Generated: $(date)
# ===========================================
# KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT
# ===========================================

POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
JWT_SECRET=${JWT_SECRET}
ASTERISK_ARI_PASSWORD=${ASTERISK_ARI_PASSWORD}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
WABA_WEBHOOK_VERIFY_TOKEN=${WABA_WEBHOOK_VERIFY}
TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET}
EOF

chmod 600 /opt/kinder/secrets/credentials.txt
echo -e "${GREEN}✓ Credentials saved to /opt/kinder/secrets/credentials.txt${NC}"

# Create .env.production file
cat > /opt/kinder/.env.production <<EOF
# ===========================================
# Kinder CRM - Production Environment
# Server: 213.109.146.167
# Domain: schoolkids.kz
# Generated: $(date)
# ===========================================

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=kinder_crm
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/kinder_crm

# ===========================================
# CACHE (Redis)
# ===========================================
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# ===========================================
# OBJECT STORAGE (MinIO)
# ===========================================
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
S3_ENDPOINT=http://minio:9000
S3_BUCKET=kinder-media
S3_ACCESS_KEY=${MINIO_ROOT_USER}
S3_SECRET_KEY=${MINIO_ROOT_PASSWORD}
S3_REGION=us-east-1

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# API CONFIGURATION
# ===========================================
NODE_ENV=production
API_BASE_URL=https://api.schoolkids.kz
PUBLIC_SITE_URL=https://schoolkids.kz

# ===========================================
# ASTERISK TELEPHONY
# ===========================================
ASTERISK_HOST=asterisk
ASTERISK_ARI_URL=http://asterisk:8088/ari
ASTERISK_ARI_USERNAME=asterisk
ASTERISK_ARI_PASSWORD=${ASTERISK_ARI_PASSWORD}

# ===========================================
# EXTERNAL INTEGRATIONS (TO BE CONFIGURED LATER)
# ===========================================
# WhatsApp Business API
WABA_PHONE_ID=
WABA_ACCESS_TOKEN=
WABA_WEBHOOK_VERIFY_TOKEN=${WABA_WEBHOOK_VERIFY}
WABA_BUSINESS_ACCOUNT_ID=

# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET}
TELEGRAM_WEBHOOK_DOMAIN=https://api.schoolkids.kz
TELEGRAM_MANAGER_CHAT_ID=

# Payment Provider
PAYMENT_PROVIDER=cloudpayments
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=

# Social Media (to be configured)
META_APP_ID=
META_APP_SECRET=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=
YANDEX_DIRECT_CLIENT_ID=
YANDEX_DIRECT_CLIENT_SECRET=
VK_APP_ID=
VK_APP_SECRET=

# ===========================================
# MONITORING
# ===========================================
LOG_LEVEL=info
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
SENTRY_DSN=

# ===========================================
# DOMAIN CONFIGURATION
# ===========================================
DOMAIN=schoolkids.kz
API_DOMAIN=api.schoolkids.kz
CRM_DOMAIN=crm.schoolkids.kz
CLIENT_DOMAIN=client.schoolkids.kz
GRAFANA_DOMAIN=grafana.schoolkids.kz

# ===========================================
# EMAIL (Transactional - to be configured)
# ===========================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@schoolkids.kz
EOF

chmod 600 /opt/kinder/.env.production
echo -e "${GREEN}✓ .env.production created${NC}"

# Display summary
echo ""
echo "======================================"
echo -e "${GREEN}  SECRETS GENERATED!${NC}"
echo "======================================"
echo ""
echo "Files created:"
echo "  /opt/kinder/secrets/credentials.txt - Master password file"
echo "  /opt/kinder/.env.production - Docker environment file"
echo ""
echo -e "${YELLOW}IMPORTANT: Save these passwords in a secure password manager!${NC}"
echo ""
echo "Database credentials:"
echo "  PostgreSQL: postgres / ${POSTGRES_PASSWORD:0:8}..."
echo "  Redis: ${REDIS_PASSWORD:0:8}..."
echo "  MinIO: ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD:0:8}..."
echo ""
echo "Service credentials:"
echo "  Grafana admin: admin / ${GRAFANA_PASSWORD:0:8}..."
echo "  Asterisk ARI: asterisk / ${ASTERISK_ARI_PASSWORD:0:8}..."
echo ""
echo "JWT Secret: ${JWT_SECRET:0:16}..."
echo ""
echo "Next step: Clone repository and deploy application"
