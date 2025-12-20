# Change: add-critical-api-tests

## Why
- Several backend routes and helpers remain untested, leaving the application vulnerable to regressions and surviving mutation trials.
- Focusing validation on the Plaid plumbing, transaction trends logic, and auth helpers will raise confidence before we ship the dashboard refinements.

## What Changes
- **ADD** a new spec capturing the targeted behaviors for the critical API routes and supporting helpers.
- **ADD** Vitest coverage for `app/api/plaid/link-error`, `app/api/transactions/trends`, `lib/auth`, `lib/plaid`, and `lib/server/session`.
- **UPDATE** the shared mock helpers so the trends suite can stub `prisma.$queryRaw` results.
- **VERIFY** the tests guard the key success and failure paths described in the new spec, satisfying the mutation/KMAT goals.

## Impact
- Affected specs: `critical-api-testing`
- Affected code: `tests/*`, `tests/test-utils/mocks.ts`, `app/api/plaid/link-error/route.ts`, `app/api/transactions/trends/route.ts`, `lib/auth.ts`, `lib/plaid.ts`, `lib/server/session.ts`
