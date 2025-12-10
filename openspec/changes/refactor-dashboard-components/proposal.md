# Change: Refactor dashboard modules

## Why
- `app/dashboard/page.tsx` has become a monolithic component that mixes data fetching, filtering, selection logic, and multiple visual sub-sections, making it hard to maintain or reuse.
- The current dashboard experiences code smells (large file size, duplicated state computations) and lacks a shared UI structure for future enhancements.
- We also want to ensure the critical transactions flow (fetching, syncing with Plaid, and reading from the local DB) has stronger automated coverage.

## What Changes
- Extract filters controls, transaction table, summary cards, pies, and selection utilities into dedicated modules under `components/dashboard` (or a `ui` namespace) while keeping `app/dashboard/page.tsx` as a thin orchestrator.
- Introduce reusable hooks or helpers per module so that each new file stays under ~300 lines, uses shared primitives (aligned with shadcn styles), and reuses React Query where appropriate for data fetching logic.
- Add targeted Vitest coverage for the transaction fetching endpoints, sync/upsert behavior, and summary aggregation to keep the module data flows safe.

## Impact
- Affected specs: dashboard UI, transactions API flows
- Affected code: `app/dashboard/page.tsx`, new `components/dashboard/*`, `components/ui/*`, test files under `tests/`
