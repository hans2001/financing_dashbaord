## ADDED Requirements
### Requirement: Dashboard UI is composed from focused modules
The dashboard SHALL expose filter controls, the transactions table, summary statistics, and category visualizations through separate components or hooks housed under `components/dashboard` or a shared `ui` area so that `app/dashboard/page.tsx` remains a thin orchestrator.

#### Scenario: Filter panel rendered via dedicated module
- **WHEN** the dashboard renders, filter controls (account selector, date range, rows, flow, sort) are provided by `FiltersPanel`.
- **THEN** each child component receives the current filter state via props and no direct DOM queries occur in `page.tsx`.

#### Scenario: Summary sections reuse shared helpers
- **WHEN** summary cards or pie charts need currency formatting or badge styles, they SHOULD import shared utilities instead of reimplementing logic.
- **THEN** each extracted module stays below ~300 lines and uses consistent primitives (e.g., shadcn content structure).

### Requirement: Transaction data flows stay covered by tests
The APIs involved in fetching transactions, syncing/upserting Plaid data, and reading aggregated summaries SHALL be covered by Vitest tests verifying their inputs and outputs so that any mutation of those flows fails fast.

#### Scenario: Transactions sync report counts and upserts
- **WHEN** Plaid returns multiple transactions and the sync endpoint runs,
- **THEN** Vitest should assert that `plaidClient.transactionsGet` called with the expected payload, upsert is invoked for every transaction, and the JSON response summarizes inserted/updated counts.

#### Scenario: Summary endpoint aggregates stored data
- **WHEN** multiple batches of `prisma.transaction.findMany` responses include positive/negative amounts and normalized categories,
- **THEN** the summary endpoint test must confirm `totalSpent`, `totalIncome`, and `categoryTotals` match the aggregated values.
