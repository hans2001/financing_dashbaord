# Change: Surface real-time Plaid account balances

## Why
The dashboard currently lists linked accounts without showing how much money is actually available. Plaid exposes `accounts/balance/get`, but we never call it, the database lacks balance fields, and the `/api/accounts` response plus UI ignore this information. Families can’t quickly gauge liquidity or credit utilization from the dashboard.

## What Changes
- Extend the ingest pipeline to call Plaid’s `accountsBalanceGet` for every linked item (initial link + manual sync) and persist per-account `current`, `available`, and `limit` values with a timestamp.
- Update the `/api/accounts` route and React Query hook to return those balances so the dashboard can format them alongside account metadata.
- Enhance the linked-accounts panel to display the balance values (including fallbacks when Plaid omits a field) and highlight outdated data.
- Add Vitest/API coverage to guarantee balances are captured, serialized, and rendered.

## Impact
- Affected specs: `dashboard`
- Affected code: Plaid ingest routes (`app/api/plaid/exchange-public-token`, `app/api/transactions/sync`), Prisma schema + migrations, `/api/accounts`, dashboard hooks/components, tests.
