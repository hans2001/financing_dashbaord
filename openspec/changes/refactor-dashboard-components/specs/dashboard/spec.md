## ADDED Requirements
### Requirement: Dashboard UI is orchestrated through modular components
`app/dashboard/page.tsx` SHALL wire all visuals through the exported modules in `components/dashboard` so the page only coordinates props/state coming from `useDashboardState`.

#### Scenario: Filters/table/summary render through dedicated modules
- **WHEN** the dashboard renders, it MUST render `FiltersPanel`, `TransactionsTable`, and `SummaryPanel` (lazy-loaded) with props derived from `useDashboardState`, plus the linked-accounts list in page-local markup. The page MUST NOT fetch data on its own—`useDashboardState` provides ready state slices.
- **THEN** the child components remain <300 lines and reuse shared helpers such as `PAGE_SIZE_OPTIONS`, `FLOW_FILTERS`, `formatCurrency`, `getCategoryBadge`, and compose smaller pieces like `DescriptionEditor` instead of reimplementing logic inline.

#### Scenario: Selection-aware summary behavior
- **WHEN** the user selects transactions through `TransactionsTable`,
- **THEN** `useDashboardState` MUST feed `SummaryPanel` the selection-derived totals/counts/category slices from `useSelectionState`; otherwise it passes the aggregated API totals. The summary rows label should report `"N selected rows"` during a selection or `"All rows in this range"` / `"Loading summary…"`.

### Requirement: Dedicated hooks own dashboard data and filters
Dashboard state SHALL be composed from hooks in `components/dashboard/hooks` so each concern stays testable and filter changes reset selections/pagination consistently.

#### Scenario: Filters and pagination reset selection
- **WHEN** `useDashboardFilters` setters (`setSelectedAccount`, `setDateRange`, `setPageSize`, `setSortOption`, `setFlowFilter`) run through the wrappers returned by `useDashboardState`,
- **THEN** they MUST clear the current selection, reset pagination to page 0, and recompute numeric page size/`isShowingAllRows` so downstream queries stay in sync.

#### Scenario: React Query hooks gate fetches on date range + refresh key
- **WHEN** `useTransactionsData`, `useAccountsData`, `useSummaryData`, and `useSyncControls` run,
- **THEN** they MUST share the `refreshKey` (incremented after sync), include the provided filters in the React Query key, send `FAMILY_AUTH_HEADERS` on every request, expose friendly `error` strings, and skip queries until both start/end dates exist.

### Requirement: Transaction data flows stay covered by tests
API endpoints powering the dashboard SHALL have Vitest coverage in `tests/api-endpoints.test.ts` so fetch/sync logic stays safe.

#### Scenario: Transactions list normalizes records
- **WHEN** the `/api/transactions` tests run, they MUST assert that sorting/flow filters get translated to Prisma `orderBy` + `where` clauses, invalid account filters raise `400`, and the serialized payload includes derived fields (`categoryPath`, `time`, `institutionName`, description edits) for use by `TransactionsTable`.

#### Scenario: Transactions sync report counts and upserts
- **WHEN** Plaid returns multiple transactions and the sync endpoint runs,
- **THEN** Vitest should assert that `plaidClient.transactionsGet` called with the expected payload, upsert is invoked for every transaction, amounts are flipped negative for spending, normalized categories are persisted, and the JSON response summarizes inserted/updated counts.

#### Scenario: Summary endpoint aggregates stored data
- **WHEN** multiple batches of `prisma.transaction.findMany` responses include positive/negative amounts and normalized categories,
- **THEN** the summary endpoint test must confirm `totalSpent`, `totalIncome`, `categoryTotals`, and largest spend/inflow metrics match the aggregated values; it should also cover the fallback to normalized categories when provided.
