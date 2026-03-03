# EdTech E2E Check

Дата: 2026-03-03

## Подготовка

1. `docker compose up -d --build api web caddy`
2. `docker compose exec api npx prisma db push --schema=/app/apps/api/prisma/schema.prisma`
3. `docker compose exec api npm --prefix /app/apps/api run seed`

## Проверки

### 1) Client catalog

`GET /client/catalog/programs`

Результат: 200, возвращается программа `STEM Start` с курсом `Python Start`.

### 2) CRM education overview

1. Логин менеджера: `POST /auth/login` (`manager@kinder.kz` / `manager123`)
2. `GET /crm/education/overview` с Bearer token

Результат: 200, метрики `{ programs: 1, courses: 1, cohorts: 1, enrollments: 1 }`.

### 3) Client personal enrollments

1. Логин клиента: `POST /auth/login` (`client@example.com` / `client123`)
2. `GET /client/me/enrollments` с Bearer token

Результат: 200, возвращается семья `Семья Demo` и ученик `Алиса Демо` с активным зачислением.

## Вывод

Интеграция `CRM -> Enrollment -> Client Portal` подтверждена на локальном окружении.
