# Future iterations

## Dashboard experience

- [x] Implement a sort-by dropdown that lets users reorder transactions by date, amount, or merchant name while respecting the current filters.
- [x] Add authentication that ensures only family members can access the dashboard.
- [x] Filter to show spending only or inflow only for the transaction table.
- [ ] Allow manual CRUD of supplemental transactions (e.g., attach to new accounts so the dashboard can track family assets overseas).
- [ ] Add a monthly trend line chart (date → spent) so momentum can be tracked without exporting data.
- [x] Show a pie chart of spending by category to highlight where money is going at a glance.
- [x] Include a description column on each transaction row to surface notes or context directly in the table.
- [ ] Treat pending credit-card charges as temporary (excluding them from summaries until they post) or automatically net them with the checking account debit so the dashboard mirrors real-world cash flow.
- [ ] Address all security concerns so unauthorized people cannot view the dashboard.
- [x] Protect `api/*` routes with at least a lightweight token/session so Plaid secrets aren’t freely callable in production.
- [x] Add input validation/ownership checks for the transaction APIs before expanding beyond the demo user to prevent accidental data leaks.
- [x] Introduce request throttling or caching on `/api/transactions` if the dashboard ends up exposed to larger traffic to avoid overloading Postgres.
- [x] Improve page navigation UX and make the filter text lower-contrast / smaller so the controls stay subtle.
- [x] Add a category filter to the transactions table controls so users can narrow rows to any normalized category.
- [ ] multi select category, and enable category filter snapshot on date range data, not on visualized data

## Architecture & modules

- [x] Break `app/dashboard/page.tsx` into smaller modules (filters, transactions table, summary/pricing panels) so each file stays under ~300 lines and the parent page simply composes the child components.
- [x] Extract helper hooks for filters, summary data, and selection state into dedicated files so each child component relies on focused hooks instead of inline logic.
- [ ] Audit shared UI primitives and hooks to determine what we can reuse; adopt `shadcn/ui` (or another consistent primitive set) for cards, buttons, and typography when new components land.
- [ ] Build targeted UI/component tests for `FiltersPanel`, `TransactionsTable`, and `SummaryPanel` (React Testing Library + mocked fetch/React Query) to exercise sorting, pagination, and filtering and to “kill crucial mutants.” (Existing tests cover `FilterChips` and `LinkedAccountsPanel` so far.)
- [x] Split `useDashboardState` into smaller, focused hooks (e.g., `useTransactionsFilters`, `useSelectionState`, `useSummaryData`) so each concern can be tested and memoized independently.
- [x] Introduce a data-fetching helper such as React Query or SWR for accounts, transactions, and summary calls to standardize caching, retries, and background refresh.
- [x] Pair `react-hook-form` with Zod schemas for filters and description editing so validation rules, defaults, and types stay in sync.
- [ ] Expand component/API test coverage using React Testing Library plus supertest/next-test-api-route-handler to cover the new modules and locked-down APIs.
- [ ] Record the dashboard refactor proposal (`refactor-dashboard-table-virtualization`) in `openspec/changes` before landing additional code so the new virtualization/filters work stays documented per the project rule.
- [ ] Schedule the SavedView model/`activeSavedViewId` column removal in `prisma/schema.prisma` for the next migration so the schema matches the pared-down dashboard capabilities.

## Platform & automation

- [ ] Layer on lightweight budgeting goals (per-category and household) that highlight spend vs. target so overages stand out immediately.
- [ ] Provide configurable alerts (email/push/webhooks) for suspicious spikes, large transfers, or low balances to help catch issues without babysitting the dashboard.
- [ ] Deploy the database and dashboard website with automated pipelines so the production stack mirrors local QA/CI environments.

## Performance plan

- [ ] Capture baseline metrics (TTFB, LCP, React commit times) using Next.js profiler + Web Vitals logging so we know what to optimize.
- [ ] Analyze bundle composition and convert large dashboard-only components (charts, tables) to dynamic imports or streaming so above-the-fold work shrinks.
- [ ] Virtualize the transactions table and memoize row renderers to avoid re-rendering hundreds of DOM nodes on filter or pagination changes.
- [ ] Batch and cache data access (React Query/SWR for client caching, API-layer response caching, background refresh) to cut redundant fetches.
- [ ] Precompute summary widgets on the server (edge cache or scheduled jobs) and hydrate them as static props so we avoid heavy client calculations.
- [ ] Defer non-critical analytics/components with `useDeferredValue`/`useTransition` hooks so filtering stays responsive.
- [ ] Profile expensive hooks like `useDashboardState`/`useSelectionState` and split responsibilities so state updates stay localized.
- [ ] Aggregate summary totals/counts/categories inside the database and reuse a cached currency formatter before revisiting table virtualization so the memory/performance profile stays stable.
- [ ] Reduce Plaid API usage by tracking `total_transactions`/`request_id` and only fetching additional batches when more data is needed so each `/api/transactions/sync` run hits Plaid the minimum number of times.

### Timeline / readiness

- Q3 (current): Monitor size/perf casually but defer all optimization work; codebase + data volume still small.
- Q4: Re-evaluate once shared workspaces + category filters ship and data balloons past ~10k transactions; only then kickoff baseline capture task.
- 2025+ or >25k monthly rows: prioritize virtualization/caching tasks; until then, keep them parked so we focus on shipping core features.

## Current components to revisit

- [ ] Review `components/dashboard/TransactionsTable.tsx`, `components/dashboard/filters/FilterSummary.tsx`, `app/page.tsx`, and `components/connect/PlaidConnectPanel.tsx` so any remaining polish, tests, or TODOs get captured before the next sprint.

## Process & documentation

- [ ] Document the planned dashboard module refactor in `openspec/changes/<change-id>` before touching `app/dashboard/page.tsx`, keeping the normed proposal/spec/tasks trio aligned with the new workflow.
- [ ] Capture any additional pre-implementation research (shared hooks, UI primitives, testing gaps) referenced in the proposal so the follow-up work stays traceable.
