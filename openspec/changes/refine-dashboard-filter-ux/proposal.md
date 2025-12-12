# Change: Refresh dashboard filter UX

## Why
The transaction filters on the dashboard currently mimic a dense spreadsheet row, which makes the UI feel cluttered and harder to scan. Our users would benefit from the same calm, progressive disclosure that apps like Notion, Linear, and Airtable use—showing key filters and active criteria up front while collapsing details until they are needed.

## What Changes
- Introduce a compact filter bar that surfaces the most valuable controls (account picker, date range summary, flow toggles) and displays active criteria with removable chips, similar to Linear or Notion’s filter chips.
- Wrap the full set of filters in an expandable/collapsible panel (accordion or details pattern) so the rest of the form can stay hidden until explicitly opened; ensure the collapse state syncs with `DashboardPage` and the panel animates and focuses predictably.
- Break the existing `FiltersPanel` into focused sub-components and helper hooks so each control and validation helper stays within ~300 lines while keeping form state in sync with `useDashboardState`; cover the new components with focused tests for the expanded layout, chip interactions, and collapse state.

## Impact
- Affected specs: `openspec/specs/dashboard/spec.md` (new requirement for filter UX)
- Affected code: `app/dashboard/page.tsx`, `components/dashboard/FiltersPanel.tsx`, newly extracted components/helpers/hooks for the filter summary, collapsible tray, and chips, plus any supporting styles or test fixtures
