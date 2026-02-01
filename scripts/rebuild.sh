#!/bin/bash

# =====================================================
# Kinder CRM - Rebuild Script
# Automatically stops containers before rebuilding
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🛑 Stopping all containers..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" -f "$SCRIPT_DIR/docker-compose.prod.yml" down

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo ""
echo "🏗️  Building and starting containers..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" -f "$SCRIPT_DIR/docker-compose.prod.yml" up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "Container status:"
docker compose -f "$SCRIPT_DIR/docker-compose.yml" -f "$SCRIPT_DIR/docker-compose.prod.yml" ps
