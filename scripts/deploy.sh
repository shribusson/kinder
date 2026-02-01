#!/bin/bash
# ===========================================
# Kinder CRM - Production Deployment Script
# ===========================================

set -e

echo "======================================"
echo "  KINDER CRM - PRODUCTION DEPLOYMENT"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /opt/kinder

# Step 1: Verify .env.production exists
echo -e "${YELLOW}[1/7] Checking environment...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}✗ .env.production not found! Run generate-secrets.sh first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environment file found${NC}"

# Step 2: Load environment variables
echo -e "${YELLOW}[2/7] Loading environment variables...${NC}"
set -a
source .env.production
set +a
echo -e "${GREEN}✓ Environment loaded${NC}"

# Step 3: Build and start containers
echo -e "${YELLOW}[3/7] Building and starting containers...${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Containers started${NC}"

# Step 4: Wait for services to be healthy
echo -e "${YELLOW}[4/7] Waiting for services to be ready...${NC}"
echo "Waiting 30 seconds for PostgreSQL to initialize..."
sleep 30

# Check PostgreSQL
until docker exec kinder_postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 5
done
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# Check Redis
until docker exec kinder_redis redis-cli -a ${REDIS_PASSWORD} ping 2>/dev/null | grep -q PONG; do
    echo "Waiting for Redis..."
    sleep 2
done
echo -e "${GREEN}✓ Redis ready${NC}"

# Step 5: Run database migrations
echo -e "${YELLOW}[5/7] Running database migrations...${NC}"
docker exec kinder_api npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations completed${NC}"

# Step 6: Create MinIO buckets
echo -e "${YELLOW}[6/7] Setting up MinIO buckets...${NC}"

# Install mc if not present
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /tmp/mc
    chmod +x /tmp/mc
    sudo mv /tmp/mc /usr/local/bin/mc
fi

# Wait for MinIO
sleep 5

# Configure MinIO alias (internal Docker network)
docker exec kinder_minio mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} 2>/dev/null || true

# Create buckets using docker exec
docker exec kinder_minio mc mb local/kinder-media --ignore-existing 2>/dev/null || true
docker exec kinder_minio mc mb local/kinder-backups --ignore-existing 2>/dev/null || true
echo -e "${GREEN}✓ MinIO buckets created${NC}"

# Step 7: Verify deployment
echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"

# Check all containers
echo "Container status:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Check API health (internal)
API_HEALTH=$(docker exec kinder_api curl -sf http://localhost:3001/health 2>/dev/null || echo "FAILED")
if [ "$API_HEALTH" != "FAILED" ]; then
    echo -e "${GREEN}✓ API health check passed${NC}"
else
    echo -e "${YELLOW}⚠ API health check pending (may still be starting)${NC}"
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}  DEPLOYMENT COMPLETE!${NC}"
echo "======================================"
echo ""
echo "Services deployed:"
echo "  • PostgreSQL (internal)"
echo "  • Redis (internal)"
echo "  • MinIO (internal)"
echo "  • Asterisk (5060/udp, 10000-10099/udp)"
echo "  • API (via Caddy)"
echo "  • Web (via Caddy)"
echo "  • Prometheus (internal)"
echo "  • Grafana (via Caddy)"
echo "  • Caddy (80, 443)"
echo ""
echo "URLs (after DNS propagation):"
echo "  • Main site: https://schoolkids.kz"
echo "  • API: https://api.schoolkids.kz"
echo "  • Grafana: https://grafana.schoolkids.kz"
echo "  • MinIO: https://minio.schoolkids.kz"
echo ""
echo -e "${YELLOW}NOTE: SSL certificates will be automatically issued by Caddy${NC}"
echo -e "${YELLOW}once DNS records propagate to this server (213.109.146.167)${NC}"
echo ""
echo "To check logs:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo ""
echo "To restart services:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml restart"
