# Change: Refine dashboard performance

## Why
- The transactions summary endpoint still loads chunks of transactions and accumulates the totals inside Node, which can exhaust memory and CPU as the dataset grows.
- Rendering the transactions table allocates a new `Intl.NumberFormat` instance for every amount, which becomes expensive when hundreds of rows render.

## What Changes
- **Summary endpoint**: replace the chunked `findMany` loop with aggregated database queries so the database computes totals, counts, and per-category sums before the API layer touches any raw rows.
- **Formatting utils**: introduce a shared currency formatter so client code reuses a single `Intl.NumberFormat`, reducing repeated allocations during table renders.
- **Tests & mocks**: expand the Prisma mocks for the new aggregate/group operations and adjust the summary endpoint tests to assert against the aggregated approach.

## Impact
- Affected specs: `dashboard-performance`
- Affected code: `app/api/transactions/summary/route.ts`, `components/dashboard/dashboard-utils.ts`, `tests/api-endpoints.test.ts`, `tests/test-utils/mocks.ts`
