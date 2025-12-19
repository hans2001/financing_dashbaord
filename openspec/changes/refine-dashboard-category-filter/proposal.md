# Change: Refresh dashboard category filter

## Why
The dashboard currently lets users focus on a single category at a time and derives the category picker from the rows that are already rendered in the table. Once a category is selected, that same filtered view shrinks the available options, which makes it hard to explore multi-category combinations or swap to another slice without first clearing the filter. We need a more flexible experience that works off of the full data snapshot for the selected range and allows multi-selecting categories without losing the underlying palette.

## What Changes
- Extend the transactions and summary APIs to understand multiple category query parameters so the backend can filter against combinations while the front end still drives the snapshot from the same source of truth.
- Fetch a dedicated category snapshot (by date range and account selection) that is not invalidated by the current category filter; render the filter UI from that stable list so the options stay visible even when the table re-renders with a subset of rows.
- Update the dashboard filter state, `FiltersPanel`, and supporting components so the category picker stores a string array and renders it as an explicit, scrollable list/grid of tags (no free-form typing allowed). Users should only be able to toggle the predefined tags, and clearing the chips resets just that list.
- Add targeted tests that verify the tag list renders the complete snapshot, selecting/removing tags updates the table via `useTransactionsData`, chips stay in sync and clearing still resets the state, and the APIs keep honoring repeated `category` parameters.

## Impact
- Affected specs: `openspec/specs/dashboard/spec.md` (introduce new dashboard filter requirement)
- Affected code: `app/api/transactions/route.ts`, `app/api/transactions/summary/route.ts`, new category snapshot endpoint/hook, `components/dashboard/useDashboardFilters.ts`, `useDashboardState.ts`, `components/dashboard/FiltersPanel.tsx`, `components/dashboard/filters/*`, and any affected tests/helpers.
