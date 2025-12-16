## Context
Syncing Plaid transactions currently performs two `findUnique` calls per transaction: one to look up the Plaid account and another to detect whether the transaction already exists. A large batch (up to 500 transactions per Plaid request) therefore triggers hundreds of small queries even though the necessary metadata can be fetched with a single multi-row query.

## Goals / Non-Goals
- **Goals:**
  - Reduce round-trips by batching the account metadata lookup and existing transaction ID checks for each Plaid response.
  - Preserve the existing counters (`fetched`, `inserted`, `updated`) without scanning the database per transaction.
- **Non-Goals:**
  - Replace the existing `prisma.transaction.upsert` calls or switch to `createMany`/`updateMany`.
  - Change the Plaid pagination strategy or add streaming.

## Decisions
- **Decision:** Gather the unique `account_id`s from each Plaid batch and call `prisma.account.findMany` once so every transaction reuses the same account map. Missing accounts still log and skip like before.
- **Decision:** Query `prisma.transaction.findMany` with the batch of `plaidTransactionId`s to build a `Set` that indicates whether an ID already exists. This allows the counters to be computed locally before calling `upsert` and eliminates the per-transaction `findUnique`.

## Risks / Trade-offs
- Batching still requires one database call per Plaid response, but the `in` lists are bounded to Plaid’s max 500 transactions per request, so we are unlikely to hit query size limits.
- The mock suite must now support the new `findMany` calls; we’ll update `tests/test-utils.mocks.ts` to provide them.

## Migration Plan
No schema changes or migrations are required; the change is limited to how the route queries accounts and transactions.

## Open Questions
- Should very large batches (when Plaid returns more than 500 rows via pagination) be chunked before building the `in` lists, or is the current response size safe enough? (Assumed safe under the current `count: 500` option.)
