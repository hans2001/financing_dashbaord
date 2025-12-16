# Change: Refresh dashboard category filter

## Why
The dashboard currently lets users focus on a single category at a time and derives the category picker from the rows that are already rendered in the table. Once a category is selected, that same filtered view shrinks the available options, which makes it hard to explore multi-category combinations or swap to another slice without first clearing the filter. We need a more flexible experience that works off of the full data snapshot for the selected range and allows multi-selecting categories without losing the underlying palette.

## What Changes
- Extend the transactions and summary APIs to understand multiple category query parameters so the backend can filter against combinations while the front end still drives the snapshot from the same source of truth.
- Fetch a dedicated category snapshot (by date range and account selection) that is not invalidated by the current category filter; derive the filter dropdown/chips from that snapshot so the options stay stable even when the table re-renders with a subset of rows.
- Update the dashboard filter state, `FiltersPanel`, and the supporting child components (summary, tray, chips) to track and render multiple categories, keeping the UI within each ~300-line module and reusing shared primitives or shadcn-friendly patterns where possible. Ensure chips and dropdowns can add/remove categories, and clearing them resets only the relevant selection while preserving others.
- Add targeted tests that verify the multi-category selector draws options from the snapshot regardless of the paginated table view, that selecting/removing categories updates the table via `useTransactionsData`, and that API queries use the new multi-value parameter.

## Impact
- Affected specs: `openspec/specs/dashboard/spec.md` (introduce new dashboard filter requirement)
- Affected code: `app/api/transactions/route.ts`, `app/api/transactions/summary/route.ts`, new category snapshot endpoint/hook, `components/dashboard/useDashboardFilters.ts`, `useDashboardState.ts`, `components/dashboard/FiltersPanel.tsx`, `components/dashboard/filters/*`, and any affected tests/helpers.
