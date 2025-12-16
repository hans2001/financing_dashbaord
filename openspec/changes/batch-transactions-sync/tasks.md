## 1. Implementation
- [ ] 1.1 Batch the Plaid account lookup by collecting unique `account_id` values per batch and calling `prisma.account.findMany` once to build an account map before iterating the transactions.
- [ ] 1.2 Batch the existence checks by querying `prisma.transaction.findMany` for the incoming `plaidTransactionId`s so the route can compute inserted vs updated counts without per-transaction `findUnique` calls.
- [ ] 1.3 Update the Vitest Prisma mocks and the `transactions sync` suite so they expect the batched lookups and continue asserting on the summary counters and normalization behavior.

## 2. Verification
- [ ] 2.1 Run `npm test -- tests/api-endpoints.test.ts` to confirm the revised sync logic passes the mocked suite.
