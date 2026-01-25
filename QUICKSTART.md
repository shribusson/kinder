# Инструкция по запуску CRM системы

## Текущий статус

✅ **Все модули реализованы и собраны:**
- API Backend (NestJS) - успешно скомпилирован
- Web Frontend (Next.js) - готов к сборке
- Docker конфигурация - 11 сервисов
- База данных PostgreSQL с полной схемой (55+ моделей)

## Быстрый старт

### 1. Запуск инфраструктуры

```bash
cd /Users/void/kinder

# Запуск всех сервисов
docker compose up -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f api
docker compose logs -f web
```

### 2. Инициализация базы данных

```bash
# Выполнение миграций
docker compose exec api npx prisma migrate deploy

# Создание начальных данных (admin user)
docker compose exec api npm run seed
```

### 3. Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| **CRM Web** | http://localhost:3000 | Next.js фронтенд |
| **API** | http://localhost:4000 | NestJS backend |
| **API Docs** | http://localhost:4000/api | Swagger документация |
| **Grafana** | http://localhost:3001 | Мониторинг (admin/admin) |
| **Prometheus** | http://localhost:9090 | Метрики |
| **MinIO Console** | http://localhost:9001 | S3 хранилище (minioadmin/minioadmin) |
| **Bull Dashboard** | http://localhost:4000/queues | Очереди задач |

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/kinder"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Redis
REDIS_HOST="redis"
REDIS_PORT="6379"

# MinIO S3
MINIO_ENDPOINT="minio"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL="false"

# Asterisk (Telephony)
ASTERISK_HOST="asterisk"
ASTERISK_ARI_PORT="8088"
ASTERISK_ARI_USER="asterisk"
ASTERISK_ARI_PASSWORD="asterisk"

# Frontend URLs
NEXT_PUBLIC_API_URL="http://localhost:4000"
WEB_URL="http://localhost:3000"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## Реализованные модули

### ✅ Core CRM
- **Лиды**: Управление потенциальными клиентами
- **Сделки**: Воронка продаж с этапами
- **Кампании**: Отслеживание маркетинговых кампаний
- **Записи**: Бронирование консультаций
- **Аналитика**: Дашборды и отчеты

### ✅ Инфраструктура
- **Очереди**: Redis + Bull (6 очередей)
  - webhooks - обработка вебхуков
  - outbound-messages - исходящие сообщения
  - calls - обработка звонков
  - media-processing - обработка медиафайлов
  - notifications - уведомления
  - analytics - аналитика
- **Хранилище**: MinIO (S3-совместимое)
- **Мониторинг**: Prometheus + Grafana + Loki
- **Резервное копирование**: Автоматические backup скрипты

### ✅ Unified Inbox
- **Backend**: ConversationsController, ConversationsService
- **WebSocket**: Реал-тайм обновления сообщений
- **Фильтры**: По каналу, поиск, непрочитанные, назначенные
- **Статистика**: Общее, непрочитанные, по каналам

### ✅ Интеграции (код готов, отключены временно)
- **Телефония**: Asterisk ARI + запись разговоров
- **WhatsApp**: Business API
- **Telegram**: Bot с командами

*Примечание: Модули каналов отключены из-за несоответствия схемы БД. См. [SCHEMA_MIGRATION.md](SCHEMA_MIGRATION.md) для плана миграции.*

## Команды разработки

### Локальная разработка

```bash
# API (с hot reload)
npm run dev:api

# Web (с hot reload)
npm run dev:web

# Prisma Studio (GUI для БД)
npm run prisma:studio
```

### Управление БД

```bash
# Создать новую миграцию
cd apps/api
npx prisma migrate dev --name migration_name

# Применить миграции
npx prisma migrate deploy

# Сбросить БД (⚠️ удалит все данные)
npx prisma migrate reset

# Обновить Prisma Client
npx prisma generate
```

### Docker команды

```bash
# Пересборка конкретного сервиса
docker compose build api
docker compose build web

# Перезапуск сервиса
docker compose restart api

# Просмотр логов
docker compose logs -f api web

# Остановка всех сервисов
docker compose down

# Полная очистка (⚠️ удалит volumes)
docker compose down -v

# Вход в контейнер
docker compose exec api sh
docker compose exec postgres psql -U postgres -d kinder
```

## Тестирование API

### Регистрация пользователя

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Вход

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Создание лида

```bash
curl -X POST http://localhost:4000/crm/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "name": "Иван Иванов",
    "phone": "+77001234567",
    "email": "ivan@example.com",
    "source": "website"
  }'
```

## Следующие шаги

### 1. Включить интеграции каналов

Необходимо выполнить миграцию схемы БД:

```bash
# См. SCHEMA_MIGRATION.md для деталей
cd apps/api

# Создать миграцию с дополнительными полями
npx prisma migrate dev --name add_channel_fields
```

После миграции:
1. Раскомментировать модули в [apps/api/src/app.module.ts](apps/api/src/app.module.ts:13-15)
2. Удалить исключения из [apps/api/tsconfig.json](apps/api/tsconfig.json:17-21)
3. Пересобрать: `docker compose build api`

### 2. Реализовать фронтенд Unified Inbox

Создать страницу `/apps/web/app/(crm)/crm/inbox/page.tsx`:
- Список разговоров с фильтрами
- Отображение истории сообщений
- WebSocket подключение для реал-тайм обновлений
- Форма отправки сообщений

### 3. Добавить Client Portal

Создать маршрут `(client)` с:
- Личным кабинетом клиента
- Историей сделок и записей
- Чатом с менеджером
- Оплатой счетов

### 4. Интеграция биллинга

- Выбрать провайдера (Stripe/Kaspi)
- Создать BillingModule
- Webhooks для обработки платежей
- Генерация счетов

## Troubleshooting

### API не запускается

```bash
# Проверить логи
docker compose logs api

# Проверить подключение к БД
docker compose exec postgres psql -U postgres -d kinder -c "SELECT 1"

# Пересобрать
docker compose build --no-cache api
```

### Ошибки миграций

```bash
# Проверить статус
docker compose exec api npx prisma migrate status

# Применить вручную
docker compose exec api npx prisma migrate deploy
```

### Web не собирается

```bash
# Очистить кеш
rm -rf apps/web/.next

# Пересобрать
docker compose build --no-cache web
```

## Мониторинг

### Grafana дашборды

1. Откройте http://localhost:3001
2. Логин: `admin` / Пароль: `admin`
3. Импортируйте дашборды из `grafana/dashboards/`

### Логи через Loki

Все логи централизованы в Loki и доступны через Grafana:
- API логи
- Web логи  
- Системные логи контейнеров

### Метрики Prometheus

Доступны на http://localhost:9090:
- Node.js метрики (heap, event loop)
- HTTP метрики (req/s, latency)
- Business метрики (leads created, deals closed)

## Резервное копирование

Скрипты в `scripts/`:

```bash
# Backup БД
./scripts/backup.sh

# Восстановление
./scripts/restore.sh backup-2026-01-25.sql.gz

# Настройка автоматического backup (cron)
crontab -e
# Добавить: 0 2 * * * /path/to/kinder/scripts/backup.sh
```

## Поддержка

- Документация API: http://localhost:4000/api
- Схема БД: `apps/api/prisma/schema.prisma`
- Статус реализации: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- План миграции: [SCHEMA_MIGRATION.md](SCHEMA_MIGRATION.md)
