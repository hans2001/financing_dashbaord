# Change: Batch transactions sync queries

## Why
- Syncing Plaid transactions currently looks up the owning account and checks for existing transactions via `findUnique` inside the per-transaction loop, so a batch of 500+ transactions generates hundreds of isolated database calls.
- These repeated lookups drive connection churn and slow down syncs as the family grows, yet the route only needs to know the account metadata and transaction IDs once per batch.

## What Changes
- **Account lookup:** before looping we gather unique Plaid account IDs from the batch and call `prisma.account.findMany` once so every transaction reuses the same account map.
- **Existence checks:** we prefetch existing transactions for the incoming IDs via `prisma.transaction.findMany`, build a lookup set, and update the inserted/updated counters based on that batch instead of using `findUnique` every time.
- **Tests:** update the sync tests and Prisma mocks so they expect the batched lookups and continue asserting on the `fetched`/`inserted`/`updated` counters.

## Impact
- Affected specs: `transactions-sync-batching`
- Affected code: `app/api/transactions/sync/route.ts`, `tests/api-endpoints.test.ts`, `tests/test-utils.mocks.ts`
