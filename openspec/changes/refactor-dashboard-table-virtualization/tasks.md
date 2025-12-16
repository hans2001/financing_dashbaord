## 1. Implementation
- [ ] 1.1 Extract the dashboard overview into smaller components/hooks so the parent page merely composes `FiltersPanel`, a transactions-area wrapper, the `SummaryPanel`, and `LinkedAccountsPanel` while each child consumes focused hooks (filters, summary data, selection).
- [ ] 1.2 Refactor `useDashboardState` into scoped hooks (e.g., `useDashboardFilters`, `useSelectionState`, `useSummaryView`, `usePaginationControls`) that expose stable callbacks and derived values to keep rerenders localized.
- [ ] 1.3 Improve the transactions table rendering by virtualizing visible rows or memoizing row renderers while preserving selection, description editing, and pagination controls.
- [ ] 1.4 Harden the filters form helpers so prop changes for date range, category, sort, and page size do not trigger unnecessary resets, and settle on shared validation helpers.
- [ ] 1.5 Expand React Testing Library / hook tests to cover the new hooks/components (filters, table virtualization, summary updates) and ensure the virtualization strategy does not regress pagination/selection behaviours.
