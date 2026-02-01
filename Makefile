# =====================================================
# Kinder CRM - Makefile
# Convenient docker commands for development & deployment
# =====================================================

.PHONY: help docker-rebuild docker-stop docker-start docker-logs docker-shell-api docker-shell-web docker-clean

help:
	@echo "Kinder CRM - Available commands:"
	@echo ""
	@echo "  make docker-rebuild    - Stop all containers and rebuild with latest code"
	@echo "  make docker-stop       - Stop all running containers"
	@echo "  make docker-start      - Start all containers"
	@echo "  make docker-logs       - Show API container logs (tail 50 lines)"
	@echo "  make docker-logs-live  - Follow API logs in real-time"
	@echo "  make docker-shell-api  - Open shell in API container"
	@echo "  make docker-shell-web  - Open shell in Web container"
	@echo "  make docker-clean      - Remove all stopped containers and images"
	@echo "  make docker-prune      - Clean up all docker artifacts"
	@echo ""

docker-rebuild:
	@bash scripts/rebuild.sh

docker-stop:
	@echo "🛑 Stopping containers..."
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml down

docker-start:
	@echo "🚀 Starting containers..."
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Containers started"

docker-logs:
	@docker logs kinder_api --tail 50

docker-logs-live:
	@docker logs -f kinder_api

docker-shell-api:
	@docker exec -it kinder_api sh

docker-shell-web:
	@docker exec -it kinder_web sh

docker-clean:
	@echo "🗑️  Cleaning up docker..."
	@docker container prune -f
	@docker image prune -f
	@echo "✅ Cleanup complete"

docker-prune:
	@echo "🗑️  Deep cleaning docker (this may take a while)..."
	@docker system prune -af
	@echo "✅ Deep cleanup complete"
