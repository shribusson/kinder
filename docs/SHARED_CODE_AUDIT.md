# Shared code audit (`@kinder/shared`)

Date: 2026-02-23

## Scope

- Monorepo package: `packages/shared`
- Backend scan: `apps/api/src/**/*.ts`
- Frontend scan: `apps/web/app/**/*.ts*`

## Current findings

1. `@kinder/shared` existed but was not imported in application code.
2. CRM stage logic was duplicated in frontend:
   - `apps/web/app/crm/deals/components/DealForm.tsx`
   - `apps/web/app/crm/deals/components/DealsKanban.tsx`
3. Backend CRM stage handling currently relies on Prisma enums (`@prisma/client`) and should remain source-of-truth for persistence validation.

## Implemented in this iteration

1. Added canonical CRM stage primitives to `packages/shared/index.ts`:
   - constants for full, visible, editable stages
   - helper guards/mappers/normalizers
2. Connected frontend CRM components to shared stage helpers.
3. Enabled web runtime consumption of workspace package:
   - dependency in `apps/web/package.json`
   - transpilation in `apps/web/next.config.mjs`

## Recommended next migration steps

1. Extend `@kinder/shared` with typed DTO-like frontend-safe contracts used by CRM forms.
2. In backend, introduce explicit mapping layer between Prisma enums and shared public contracts (without replacing Prisma as database enum source).
3. Add contract tests to ensure shared constants remain aligned with Prisma schema/migrations.
4. Reuse shared validators in web forms to reduce drift in stage transitions.

## Risks and notes

- Stage taxonomy drift between Prisma and shared contracts remains possible without alignment tests.
- Keep migration incremental: avoid replacing Prisma enum usage in persistence/service layer directly.