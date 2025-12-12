## 1. Implementation
- [ ] 1.1 Add balance columns (`currentBalance`, `availableBalance`, `creditLimit`, `balanceLastUpdated`) to the `Account` model via Prisma schema + migration.
- [ ] 1.2 Update Plaid ingest flows (public token exchange + `/api/transactions/sync`) to call `accountsBalanceGet` and upsert balances for every account.
- [ ] 1.3 Extend `/api/accounts` and the dashboard React Query hook typings to return balance data with normalized fallbacks + stale indicators.
- [ ] 1.4 Update the linked accounts panel UI to render the balances using `formatCurrency`, show credit limit when available, and surface "stale" warnings when timestamps exceed the freshness threshold.
- [ ] 1.5 Add/extend Vitest coverage (API + component or hook tests) to assert balances are saved, serialized, and rendered with fallbacks.
