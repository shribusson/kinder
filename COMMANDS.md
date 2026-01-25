# Quick Command Reference

## Development

### Start Services
\`\`\`bash
# Start infrastructure only
docker compose up -d postgres redis minio

# Start all services
docker compose up -d

# Start API (development mode)
npm run dev:api

# Start Web (development mode)
npm run dev:web
\`\`\`

### Database
\`\`\`bash
# Generate Prisma client
cd apps/api && npx prisma generate

# Create migration
cd apps/api && npx prisma migrate dev --name migration_name

# Apply migrations (production)
cd apps/api && npx prisma migrate deploy

# Seed database
cd apps/api && npm run seed

# Open Prisma Studio
cd apps/api && npx prisma studio

# Reset database (WARNING: deletes all data)
cd apps/api && npx prisma migrate reset
\`\`\`

### Testing
\`\`\`bash
# Run API tests
cd apps/api && npm run test

# Run tests in watch mode
cd apps/api && npm run test:watch

# Run E2E tests
cd apps/api && npm run test:e2e

# Generate coverage report
cd apps/api && npm run test:cov
\`\`\`

### Build
\`\`\`bash
# Build all
npm run build

# Build API only
npm run -w @kinder/api build

# Build Web only
npm run -w @kinder/web build
\`\`\`

### Linting
\`\`\`bash
# Lint all
npm run lint

# Lint with auto-fix
npm run lint -- --fix
\`\`\`

## Docker Management

### Container Operations
\`\`\`bash
# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f api
docker compose logs -f web

# Restart service
docker compose restart api

# Stop all services
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
\`\`\`

### Execute Commands in Containers
\`\`\`bash
# Access API container shell
docker exec -it kinder_api sh

# Access database
docker exec -it kinder_postgres psql -U postgres kinder_crm

# Run migrations in container
docker exec kinder_api npx prisma migrate deploy

# Seed database in container
docker exec kinder_api npm run seed
\`\`\`

## Database Operations

### Backup
\`\`\`bash
# Manual backup
./scripts/backup.sh

# Backup to specific location
docker exec kinder_postgres pg_dump -U postgres kinder_crm > backup_$(date +%Y%m%d).sql

# Compressed backup
docker exec kinder_postgres pg_dump -U postgres kinder_crm | gzip > backup_$(date +%Y%m%d).sql.gz
\`\`\`

### Restore
\`\`\`bash
# From SQL file
docker exec -i kinder_postgres psql -U postgres kinder_crm < backup.sql

# From compressed file
gunzip < backup.sql.gz | docker exec -i kinder_postgres psql -U postgres kinder_crm
\`\`\`

## MinIO Operations

### Setup MinIO CLI
\`\`\`bash
# Install mc (MinIO client)
brew install minio/stable/mc  # macOS
# or download from https://min.io/docs/minio/linux/reference/minio-mc.html

# Configure alias
mc alias set local http://localhost:9000 minioadmin minioadmin
\`\`\`

### Bucket Operations
\`\`\`bash
# List buckets
mc ls local

# Create bucket
mc mb local/kinder-media

# List objects in bucket
mc ls local/kinder-media

# Copy bucket
mc mirror local/kinder-media ./backup

# Upload file
mc cp file.pdf local/kinder-media/documents/

# Download file
mc cp local/kinder-media/documents/file.pdf ./
\`\`\`

## Monitoring

### Access Services
\`\`\`bash
# Grafana (username: admin, password: from .env)
open http://localhost:3003

# Prometheus
open http://localhost:9090

# MinIO Console
open http://localhost:9001

# API Health Check
curl http://localhost:3001/health

# API Metrics (when implemented)
curl http://localhost:3001/metrics
\`\`\`

### View Logs
\`\`\`bash
# All services
docker compose logs -f

# Specific service with tail
docker compose logs -f --tail=100 api

# Follow logs for multiple services
docker compose logs -f api web postgres
\`\`\`

## Production Deployment

### Initial Setup
\`\`\`bash
# Clone repository
git clone <repo-url>
cd kinder

# Configure environment
cp .env.example .env
vim .env  # Edit with production values

# Start services
docker compose up -d

# Wait for services to be healthy
docker compose ps

# Run migrations
docker exec kinder_api npx prisma migrate deploy

# Seed initial data
docker exec kinder_api npm run seed
\`\`\`

### Updates
\`\`\`bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Run new migrations
docker exec kinder_api npx prisma migrate deploy

# Check service status
docker compose ps
\`\`\`

### Troubleshooting
\`\`\`bash
# Check if Docker is running
docker ps

# Check container status
docker compose ps

# View resource usage
docker stats

# Inspect container
docker inspect kinder_api

# Check disk space
df -h

# Clean up unused Docker resources
docker system prune -a

# Check for port conflicts
lsof -i :3000
lsof -i :3001
lsof -i :5432
\`\`\`

## Git Workflow

### Feature Development
\`\`\`bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub
\`\`\`

### Hotfixes
\`\`\`bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Make fix and commit
git add .
git commit -m "fix: critical issue"

# Push and create PR
git push origin hotfix/critical-fix
\`\`\`

## Useful Aliases (Add to ~/.zshrc or ~/.bashrc)

\`\`\`bash
# Docker Compose shortcuts
alias dc="docker compose"
alias dcu="docker compose up -d"
alias dcd="docker compose down"
alias dcl="docker compose logs -f"
alias dcp="docker compose ps"
alias dcr="docker compose restart"

# Kinder-specific
alias kinder-logs="docker compose -f /opt/kinder/docker-compose.yml logs -f"
alias kinder-restart="cd /opt/kinder && docker compose restart"
alias kinder-backup="/opt/kinder/scripts/backup.sh"

# Development
alias api-dev="npm run dev:api"
alias web-dev="npm run dev:web"
alias db-studio="cd apps/api && npx prisma studio"
\`\`\`

## Environment Variables Quick Reference

\`\`\`bash
# Check if variable is set
echo $DATABASE_URL

# List all environment variables in container
docker exec kinder_api env

# Check specific variable in container
docker exec kinder_api env | grep DATABASE_URL
\`\`\`

## Performance & Debugging

### Database Performance
\`\`\`bash
# Connect to database
docker exec -it kinder_postgres psql -U postgres kinder_crm

# Inside psql:
\\dt                                    # List tables
\\d+ "User"                            # Describe table
SELECT * FROM "User" LIMIT 10;        # Query data
\\q                                    # Exit

# Check slow queries (if pg_stat_statements enabled)
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# Check active connections
SELECT * FROM pg_stat_activity;
\`\`\`

### Redis Operations
\`\`\`bash
# Connect to Redis
docker exec -it kinder_redis redis-cli

# Inside redis-cli:
PING                    # Test connection
KEYS *                  # List all keys (don't use in production)
INFO                    # Server info
DBSIZE                  # Number of keys
FLUSHDB                 # Clear database (WARNING)
exit                    # Exit
\`\`\`

### API Debugging
\`\`\`bash
# Test API endpoint
curl -X GET http://localhost:3001/health

# Test with authentication
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@kinder.kz","password":"admin123"}'

# Test protected endpoint
curl -X GET http://localhost:3001/auth/me \\
  -H "Authorization: Bearer <access-token>"
\`\`\`

## Security

### SSL Certificate Management (Caddy)
\`\`\`bash
# Caddy automatically manages certificates
# View certificate info
docker exec kinder_caddy caddy list-certificates

# Reload Caddyfile
docker exec kinder_caddy caddy reload --config /etc/caddy/Caddyfile
\`\`\`

### Password Management
\`\`\`bash
# Generate secure random password
openssl rand -base64 32

# Hash password (bcrypt) - for testing
node -e "console.log(require('bcrypt').hashSync('password', 10))"
\`\`\`

## Scheduled Tasks (Cron)

### Add Backup Cron Job
\`\`\`bash
# Edit crontab
crontab -e

# Add this line (daily at 2 AM):
0 2 * * * /opt/kinder/scripts/backup.sh >> /var/log/kinder-backup.log 2>&1

# View cron jobs
crontab -l

# View cron logs
grep CRON /var/log/syslog
\`\`\`
