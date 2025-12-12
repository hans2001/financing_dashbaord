## 1. Implementation
- [x] 1.1 Identify coherent responsibilities in `app/dashboard/page.tsx` (filters, table, summaries, selections) and sketch component/hook boundaries.
- [x] 1.2 Create new UI folders (e.g., `components/dashboard`, `components/ui`) and move the extracted sections, ensuring each file stays <~300 lines.
- [x] 1.3 Consolidate shared helpers (date formatting, currency formatting, badge mapping) into dedicated modules consumed by the new components.
- [x] 1.4 Update `app/dashboard/page.tsx` to orchestrate the new modules and rely on consistent shadcn-tailored primitives.
- [x] 1.5 Implement or enhance Vitest tests targeting the transactions list, sync/upsert, and summary endpoints to cover the core data flow.
- [x] 1.6 Introduce dedicated hooks for syncing plus React Query data fetching (`useSyncControls`, `useAccountsData`, `useTransactionsData`, `useSummaryData`) and selection math (`useSelectionState`) so `useDashboardState` stays lean.
- [x] 1.7 Extract filter/pagination state into its own hook(s) and add unit tests around the new hooks to lock behavior down.

## 2. Validation
- [x] 2.1 Run `npm run lint`.
- [x] 2.2 Run existing Vitest suites (e.g., `npm run test` or equivalent) and confirm new tests pass.
