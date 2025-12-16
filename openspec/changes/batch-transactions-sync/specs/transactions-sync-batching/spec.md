## ADDED Requirements
### Requirement: Transaction sync batches account lookups and existence checks
The `/api/transactions/sync` endpoint SHALL gather the Plaid account IDs and transaction IDs from each fetched batch, load the accounts in a single `prisma.account.findMany` call, and load the existing transactions in a single `prisma.transaction.findMany` call so the per-transaction loop can reuse those maps instead of issuing `findUnique` for every item.

#### Scenario: Reusing metadata for a large Plaid batch
- **GIVEN** Plaid returns hundreds of transactions spanning two accounts and the route is configured with `count: 500`,
- **WHEN** the sync handler runs,
- **THEN** it SHALL call `prisma.account.findMany` once with both account IDs and `prisma.transaction.findMany` once with the provided `plaidTransactionId`s,
- **THEN** the handler SHALL reuse the resulting maps while iterating the batch and still report the correct `fetched`, `inserted`, and `updated` counters without issuing per-item `findUnique` queries.

#### Scenario: One Plaid fetch per sync run
- **GIVEN** the route already limits each Plaid request to at most `count: 500` transactions,
- **WHEN** Plaid returns a batch that does not require pagination,
- **THEN** the handler SHALL make only one `plaidClient.transactionsGet` call for that sync, reusing its single response for batching the account and transaction lookups so we never issue extra Plaid requests within the same run.
