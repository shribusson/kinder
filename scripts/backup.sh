#!/bin/bash

# Kinder CRM Backup Script
# This script backs up PostgreSQL database and MinIO data

set -e

# Configuration
BACKUP_DIR="/backups/kinder"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
POSTGRES_CONTAINER="kinder_postgres"
POSTGRES_DB="kinder_crm"
POSTGRES_USER="postgres"

# Telegram notification (optional)
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_MANAGER_CHAT_ID:-}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting backup at $(date)"

# Backup PostgreSQL
echo "📦 Backing up PostgreSQL database..."
docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > "$BACKUP_DIR/postgres_${TIMESTAMP}.sql"

if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL backup successful: postgres_${TIMESTAMP}.sql"
  # Compress
  gzip "$BACKUP_DIR/postgres_${TIMESTAMP}.sql"
  echo "🗜️  Compressed: postgres_${TIMESTAMP}.sql.gz"
else
  echo "❌ PostgreSQL backup failed"
  send_telegram_alert "❌ PostgreSQL backup failed"
  exit 1
fi

# Backup MinIO (optional - uses mc mirror)
# Requires MinIO client (mc) to be installed
if command -v mc &> /dev/null; then
  echo "📦 Backing up MinIO data..."
  mc alias set local http://localhost:9000 minioadmin minioadmin
  mc mirror local/kinder-media "$BACKUP_DIR/minio_${TIMESTAMP}/"
  
  if [ $? -eq 0 ]; then
    echo "✅ MinIO backup successful"
    tar -czf "$BACKUP_DIR/minio_${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" "minio_${TIMESTAMP}"
    rm -rf "$BACKUP_DIR/minio_${TIMESTAMP}"
    echo "🗜️  Compressed: minio_${TIMESTAMP}.tar.gz"
  else
    echo "⚠️  MinIO backup failed (continuing...)"
  fi
fi

# Cleanup old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "minio_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed successfully at $(date)"
send_telegram_alert "✅ Backup completed successfully"

# Function to send Telegram notification
function send_telegram_alert() {
  local message="$1"
  
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "text=${message}" \
      -d "parse_mode=HTML" > /dev/null
  fi
}
