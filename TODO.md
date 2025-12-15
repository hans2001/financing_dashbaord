# Future iterations

## Dashboard experience

- [x] Implement a sort-by dropdown that lets users reorder transactions by date, amount, or merchant name while respecting the current filters.
- [x] Add authentication that ensures only family members can access the dashboard.
- [ ] Pre-register Yuki and Hans accounts with proper roles so they can sign in without extra onboarding.
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
- [ ] AI assisted transaction categorizing
- [ ] AI assistated financing structures suggestion and refinement
- [ ] RAG pipeline to local database that feed AI knowledge
- [ ] multi select category, and enable category filter snapshot on date range data, not on visualized data

## Architecture & modules

- [ ] Break `app/dashboard/page.tsx` into smaller modules (filters, transactions table, summary/pricing panels) so each file stays under ~300 lines and the parent page simply composes the child components.
- [ ] Extract helper hooks for filters, summary data, and selection state into dedicated files so each child component relies on focused hooks instead of inline logic.
- [ ] Audit shared UI primitives and hooks to determine what we can reuse; adopt `shadcn/ui` (or another consistent primitive set) for cards, buttons, and typography when new components land.
- [ ] Build targeted UI/component tests for `FiltersPanel`, `TransactionsTable`, and `SummaryPanel` (React Testing Library + mocked fetch/React Query) to exercise sorting, pagination, and filtering and to “kill crucial mutants.”
- [ ] Split `useDashboardState` into smaller, focused hooks (e.g., `useTransactionsFilters`, `useSelectionState`, `useSummaryData`) so each concern can be tested and memoized independently.
- [x] Introduce a data-fetching helper such as React Query or SWR for accounts, transactions, and summary calls to standardize caching, retries, and background refresh.
- [x] Pair `react-hook-form` with Zod schemas for filters and description editing so validation rules, defaults, and types stay in sync.
- [ ] Expand component/API test coverage using React Testing Library plus supertest/next-test-api-route-handler to cover the new modules and locked-down APIs.

## Platform & automation

- [ ] Layer on lightweight budgeting goals (per-category and household) that highlight spend vs. target so overages stand out immediately.
- [ ] Introduce shared saved views/workspaces so Hans and Yuki can pin their own account selections and column presets, including a “family view” that aggregates every linked account plus user-specific filters.
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

### Timeline / readiness

- Q3 (current): Monitor size/perf casually but defer all optimization work; codebase + data volume still small.
- Q4: Re-evaluate once shared workspaces + category filters ship and data balloons past ~10k transactions; only then kickoff baseline capture task.
- 2025+ or >25k monthly rows: prioritize virtualization/caching tasks; until then, keep them parked so we focus on shipping core features.
