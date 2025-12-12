# Change: Add category filter to dashboard transactions

## Why
The transactions table only supports flow and account filters, so users cannot quickly isolate spend within a specific normalized category. Adding a scoped category selector unlocks many TODO items and builds directly on the new filter hooks.

## What Changes
- Introduce a category dropdown/tag selector next to the Flow filter on the dashboard page with the same styling primitives.
- Extend `useDashboardFilters`/`useDashboardState` to track a `categoryFilter` value, propagate it to the React Query key, and reset pagination on change.
- Update the `/api/transactions` route to accept an optional `category` query parameter and narrow Prisma queries accordingly.
- Add React Testing Library coverage for the new filter behavior plus API tests (or Vitest mocks) that ensure the parameter is forwarded.

## Impact
- Affected specs: transactions-filters
- Affected code: app/dashboard/page.tsx, components/dashboard/hooks/useDashboardFilters.ts, components/dashboard/useDashboardState.ts, app/api/transactions/route.ts, related tests/styles
