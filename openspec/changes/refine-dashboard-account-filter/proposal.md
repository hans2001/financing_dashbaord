# Change: Surface multi-select account filters above the dashboard table

## Why
The saved view / view switcher experience is confusing for the primary dashboard users. We already have the dataset needed to scope the transaction table by account, so the filters should make account selection first-class instead of hiding it behind another view layer.

## What Changes
- Replace the view-focused content with a compact multi-select account control inside the dashboard filter panel so users can include/exclude linked accounts without losing sight of the transactions.
- Render tag chips for each selected account, keep the panel layout stable while supporting collapse/expand, and propagate the selection to the transactions summary + saved view metadata.
- Update the filter helpers and tests to support the new control, and document the expected UX through a dedicated dashboard filtering spec delta.

## Impact
- Affected specs: `dashboard-filtering`
- Affected code: `app/dashboard/page.tsx`, `components/dashboard/FiltersPanel.tsx`, `components/dashboard/filters/*`, `components/dashboard/hooks/useDashboardFilters.ts`, `components/dashboard/hooks/useTransactionsData.ts`, `tests/components/dashboard/*`
