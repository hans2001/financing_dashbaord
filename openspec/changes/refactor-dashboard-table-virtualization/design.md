## Context
- The dashboard page currently wires filters, selections, summary data, and table rendering through a single `useDashboardState` hook, so every UI change or data refresh re-enters a large component tree and rerenders everything.
- The transactions table renders every row inside the DOM even when pagination is active, which delays interactions once the dataset grows and keeps `DescriptionEditor` instances alive for unseen rows.
- `FiltersPanel` resets its `react-hook-form` state whenever any prop changes, so users lose focus and trigger extra renders when the dashboard refreshes or when a controlled value slightly drifts.

## Goals / Non-Goals
- Goals
  - Keep the dashboard page composed of small, testable components and expose precise hooks for the filters, pagination, selection state, and summary values.
  - Keep the selection, description editing, pagination controls, and summary panel behavior unchanged while improving rendering performance via virtualization/memoization.
  - Prevent the filter form from resetting unnecessarily during prop updates by decoupling the form state from the parent props and relying on deterministic helpers.
- Non-Goals
  - No API or schema changes are required; all data remains available through the current `useTransactionsData`, `useSummaryData`, and `useAccountsData` hooks.
  - No UX redesign for the summary panel, filters, or pagination controls beyond the stability/performance work already scoped.

## Decisions
- **Virtualization library**: Use `@tanstack/react-virtual` (already in the codebase via React Query) to render only the visible portion of the transactions list inside a scrollable container, ensuring pagination and selection callbacks still target the right rows.
- **Hook decomposition**: Break `useDashboardState` into `useDashboardFilters`, `usePaginationControls`, `useSelectionState`, `useSummaryView`, and `useSyncState` (or similar) so each concern can implement memoized selectors and only expose necessary callbacks to its consumer.
- **Filter form synchronization**: Keep the `react-hook-form` controls focused on local state/data and only reset when the underlying props genuinely change by comparing values before calling `reset`. Move shared validation logic into reusable helpers in `components/dashboard/forms` so multiple panels can reuse them without duplicating the `useForm` setup.
- **Component layout**: Let `app/dashboard/page.tsx` orchestrate the child components (`FiltersPanel`, a new `TransactionsSection` with virtualization, the `SummaryPanel`, and `LinkedAccountsPanel`) and keep the heavy logic inside `hooks`/`components` that can be unit tested independently.

## Risks / Trade-offs
- Virtualization can make auto-sizing and sticky headers more complex; we must ensure the header stays aligned and selection checkboxes remain accessible for keyboard users.
- Breaking `useDashboardState` may briefly diverge from the existing stable API until we wire all consumers to the new hooks, so thorough testing of the new hook combinations is essential.
- Adding `react-virtual` (or similar) introduces an extra dependency but avoids rolling a custom virtualization solution that would likely have more regressions.

## Migration Plan
1. Build the new child components/hooks and ensure `app/dashboard/page.tsx` composes them the same way as before without altering user-visible behavior.
2. Update `FiltersPanel`/`FilterTray` to rely on the new hook interfaces so they can receive synchronized values without forcing `react-hook-form` resets.
3. Introduce the virtualization layer around the transactions table and verify that selection/pagination callbacks still fire for the correct rows via unit tests.
4. Add RTL tests for the newly extracted hooks/components to lock down behaviour before removing the old monolithic logic.

## Open Questions
- Should virtualization cover the entire table (header + body) or just the body, letting the header stay outside the scrollable region?
- Do we want to expose the virtualization hook to other dashboards (e.g., future tables) or keep it specific to this transactions list?
