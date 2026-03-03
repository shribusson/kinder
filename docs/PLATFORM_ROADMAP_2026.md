# Platform roadmap 2026

Date: 2026-02-23  
Branch context: `production-minimal`

## Goals

1. Stabilize core CRM workflows and reduce regression risk.
2. Unify domain contracts across frontend/backend.
3. Increase delivery speed with predictable CI/CD and observability.
4. Prepare architecture for higher нагрузка and multi-channel growth.

## Q1 (0–3 months): Foundation and alignment

### Streams

- Shared contracts and type consistency
  - Expand `@kinder/shared` for CRM/public contract primitives.
  - Remove duplicated frontend stage mapping logic (started).
  - Add contract alignment checks against Prisma schema.

- Documentation baseline
  - Create architecture map (API modules, Web domains, infra services).
  - Add ownership matrix for critical modules (`crm`, `workorder`, `telephony`, `integrations`).
  - Keep operational runbooks in one docs index.

- Quality gates
  - Add CI pipeline: install, build (`web` + `api`), unit tests, Prisma generate.
  - Enforce minimum coverage trend (not strict jump, step-by-step increase).

### Exit criteria

- Shared contract package is used in at least CRM web forms/kanban and selected API DTO boundaries.
- Every PR runs unified build/test pipeline.
- Documentation index exists and links to runbooks, architecture, and deployment steps.

## Q2–Q3 (3–9 months): Product robustness and operational maturity

### Streams

- Backend modular hardening
  - Define explicit module boundaries and anti-corruption mappers around Prisma models.
  - Extract high-churn logic from services into reusable domain components.
  - Add idempotent handlers for external channel webhooks.

- CRM experience improvements
  - Normalize deal/booking/workorder transitions with explicit state rules.
  - Add timeline consistency checks and SLA-oriented dashboards.
  - Improve error transparency in manager UI (actionable errors, retry hints).

- Observability and SRE readiness
  - Expand Grafana dashboards for queue latency, webhook failures, telephony health.
  - Add alert routing with severity levels and runbook links.
  - Standardize structured logging fields across API modules.

### Exit criteria

- Critical workflows (lead → deal → booking/workorder) have transition guards and regression tests.
- Alerting covers service availability, queue health, and integration error rates.
- Mean time to detect and triage production incidents is measurably reduced.

## Q4+ (9–24 months): Scale architecture

### Streams

- Performance and scaling
  - Profile bottlenecks in API/DB/queue paths.
  - Introduce read-optimized patterns for analytics-heavy CRM views.
  - Evaluate service decomposition only for proven hotspots.

- Integration platform
  - Build unified integration SDK layer for Telegram/WhatsApp/Telephony adapters.
  - Add replay/debug tooling for failed inbound events.

- Delivery platform
  - Progressive rollout strategy (canary/blue-green where justified).
  - Disaster recovery drills and backup restore verification automation.

### Exit criteria

- Platform sustains growth without significant regression in latency/reliability.
- Integration failures are observable, replayable, and recoverable with low manual effort.
- Deployment risk is reduced with repeatable rollout and rollback procedures.

## Risks to watch

1. Domain drift between Prisma enums and shared contracts.
2. Monolithic service growth without clear module ownership.
3. Low signal monitoring (dashboards without actionable alerting).
4. CI bypass pressure if build/test times grow without optimization.

## Immediate next implementation items

1. Extend `@kinder/shared` with additional CRM contract primitives.
2. Add CI workflow for build/test gates.
3. Write technical debt register for `apps/api/src/*` modules.