# Technical Debt Register

_Last updated: 2026-03-03_

This register tracks known technical debt across the `apps/api/src/*` modules.
Each item includes a severity level (**critical / high / medium / low**), a short description,
the affected files, and the recommended remediation.

---

## Critical

### TD-001 · Telephony module uses metadata JSON workaround for call fields

**Module**: `telephony`  
**Files**: `src/telephony/telephony.service.ts`  
**Impact**: Schema-level `from`, `to`, `externalId` fields that should be first-class columns
are stored in a `metadata: Json` field. This prevents indexed lookups and makes query
filtering verbose.  
**Remediation**: Add `from String?`, `to String?`, `externalId String?` columns to the `Call`
model (see `SCHEMA_MIGRATION.md`), run `npx prisma migrate dev --name add_call_fields`, and
update service code to use the new columns.

---

### TD-002 · Telegram and WhatsApp modules lack webhook signature verification

**Module**: `telegram`, `whatsapp`  
**Files**: `src/telegram/telegram.service.ts`, `src/whatsapp/whatsapp.service.ts`  
**Impact**: Inbound webhook endpoints accept requests without verifying the HMAC / secret
token, which can allow spoofed events.  
**Remediation**: Implement `X-Hub-Signature-256` verification for Meta and Telegram
`secretToken` validation before processing any payload.

---

## High

### TD-003 · Missing Prisma migrations for initial schema

**Module**: infrastructure  
**Files**: `apps/api/prisma/migrations/`  
**Impact**: The schema has never been run through `prisma migrate dev`; there are no SQL
migration files. Deployments rely on `prisma db push` or manual DDL.  
**Remediation**: Run `npx prisma migrate dev --name init` to generate the initial migration,
commit the result, and switch CI to `prisma migrate deploy`.

---

### TD-004 · No unit or integration tests for CRM service

**Module**: `crm`  
**Files**: `src/crm/crm.service.ts`, `src/crm/*.spec.ts`  
**Impact**: Core business logic (lead/deal CRUD, analytics aggregation) has no automated
regression coverage.  
**Remediation**: Add Jest unit tests for `CrmService` methods using a mocked `PrismaService`.
Target ≥70 % branch coverage for `crm.service.ts` as a first step.

---

### TD-005 · AccountId resolved from first DB row as fallback

**Module**: `client`  
**Files**: `src/client/client.controller.ts` (lines ~20–24)  
**Impact**: When no authenticated user is present _and_ no `?accountId` query param is
supplied, the controller silently falls back to the first `Account` row. In a multi-tenant
setup this leaks data between tenants.  
**Remediation**: Remove the last-resort fallback. Require `accountId` as a mandatory query
parameter for all public catalog endpoints, or derive it from a subdomain/slug.

---

### TD-006 · `@kinder/shared` package has no build step

**Module**: `packages/shared`  
**Files**: `packages/shared/package.json`, `packages/shared/index.ts`  
**Impact**: The package is consumed by direct TypeScript `import`, which couples consumers
to the TypeScript source. This blocks any future compilation caching and makes the package
non-publishable.  
**Remediation**: Add a `tsup` or `tsc` build step; output `dist/index.js` + `dist/index.d.ts`;
update `package.json` `"main"` and `"types"` to point at `dist/`.

---

## Medium

### TD-007 · Bull queue processors swallow errors silently

**Module**: `queue`  
**Files**: `src/queue/processors/`  
**Impact**: Failed jobs are caught and logged but not re-thrown. Bull therefore marks them as
`completed` instead of `failed`, breaking retry and dead-letter semantics.  
**Remediation**: Re-throw (or return a rejected Promise from) the processor after logging so
Bull correctly classifies the job as failed and applies the configured retry policy.

---

### TD-008 · Hardcoded default credentials in docker-compose

**Module**: infrastructure  
**Files**: `docker-compose.yml`  
**Impact**: `minioadmin / minioadmin` and `postgres / postgres` are used as defaults when
the corresponding `${...}` env vars are absent. Developers may forget to override these in
staging/production.  
**Remediation**: Remove the `:-default` fallbacks for secrets; require explicit env var values;
document this in `.env.example` with `# REQUIRED` annotations.

---

### TD-009 · Web app has no error boundary around async server components

**Module**: `web`  
**Files**: `apps/web/app/`  
**Impact**: If an API call inside a server component throws, Next.js will render the
nearest `error.tsx`. Most route segments currently lack a co-located `error.tsx`.  
**Remediation**: Add `error.tsx` to all top-level route segments (`crm/`, `client/`,
marketing `(marketing)/`).

---

### TD-010 · `MediaFile.name` field missing from Prisma schema

**Module**: `storage`, `telephony`  
**Files**: `apps/api/prisma/schema.prisma` (model `MediaFile`), `src/telephony/telephony.service.ts`  
**Impact**: The telephony service tries to create a `MediaFile` with a `name` field that does
not exist in the schema, causing a runtime Prisma error.  
**Remediation**: Add `name String` to the `MediaFile` model as described in `SCHEMA_MIGRATION.md`
and run a migration.

---

## Low

### TD-011 · `DealStage` type in `@kinder/shared` is out of sync with Prisma enum

**Module**: `packages/shared`  
**Files**: `packages/shared/index.ts`  
**Impact**: The exported `DealStage` union type lists the old KinderCRM stages (`new`,
`contacted`, …) which differ from the Prisma enum values (`diagnostics`, `planned`, …).
Consumers can accidentally import the wrong type.  
**Remediation**: Deprecate the misnamed `DealStage` export (already marked `@deprecated`);
migrate all consumers to `CrmDealStage`.

---

### TD-012 · Loki retention and alerting not configured

**Module**: infrastructure  
**Files**: `loki-config.yaml`  
**Impact**: Logs accumulate indefinitely; no alerting rules are set for error-rate spikes.  
**Remediation**: Add `limits_config.retention_period` to Loki config and create Grafana
alerting rules for `level="error"` log rate.

---

## How to use this register

1. When you identify new debt, open a PR that adds an entry here.  
2. When debt is resolved, move the entry to the **Resolved** section below and record
   the PR / commit that fixed it.  
3. Review this register at the start of each sprint and assign remediation items to the
   backlog.

---

## Resolved

_No items resolved yet._
