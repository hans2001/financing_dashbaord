# Change: Refine dashboard rendering stability

## Why
- The current dashboard page composes the filters, summary, and transactions table all inside `useDashboardState`, so any state update forces a full re-render even if only the filters or selection change.
- The transactions list renders every fetched row inline (including description editors, badges, and the selection checkbox), which bloats the DOM, delays repainting, and prevents the table from scaling once paging hits the hundreds.
- The filter form resets whenever the props change, which interrupts typing and introduces unnecessary renders that counteract the benefits of the layout refactor we need.

## What Changes
- **Dashboard page structure**: Split `app/dashboard/page.tsx` into focused child modules (filters, transactions table wrapper, summary/panel) and move heavy hooks (`useDashboardState`) logic into smaller, memoized hooks that alternate between filter state, selection state, and summary data.
- **Transactions table performance**: Introduce row virtualization or memoized row renderers so only visible rows and the header re-render on filter/pagination changes; keep selection, pagination, and description editing behaviour intact and accessible.
- **Filter UX stability**: Stabilize the filters form so prop updates no longer trigger full `react-hook-form` resets and allow shared helpers (e.g., from `forms/`) to manage validation and defaults more predictably.
- **Testing & specs**: Add targeted RTL/unit tests for the extracted hooks/components and capture the migration in `openspec/changes/refactor-dashboard-table-virtualization/specs/transactions-table-density/spec.md` so reviewers understand the behavioural expectations.

## Impact
- Affected specs: `transactions-table-density`
- Affected code: `app/dashboard/page.tsx`, `components/dashboard/FiltersPanel.tsx`, `components/dashboard/TransactionsTable.tsx`, `components/dashboard/LinkedAccountsPanel.tsx`, `components/dashboard/useDashboardState.ts`, any new helper hooks/components and associated tests.
