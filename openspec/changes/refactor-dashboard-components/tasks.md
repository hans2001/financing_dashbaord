## 1. Implementation
- [ ] 1.1 Identify coherent responsibilities in `app/dashboard/page.tsx` (filters, table, summaries, selections) and sketch component/hook boundaries.
- [ ] 1.2 Create new UI folders (e.g., `components/dashboard`, `components/ui`) and move the extracted sections, ensuring each file stays <~300 lines.
- [ ] 1.3 Consolidate shared helpers (date formatting, currency formatting, badge mapping) into dedicated modules consumed by the new components.
- [ ] 1.4 Update `app/dashboard/page.tsx` to orchestrate the new modules and rely on consistent shadcn-tailored primitives.
- [ ] 1.5 Implement or enhance Vitest tests targeting the transactions list, sync/upsert, and summary endpoints to cover the core data flow.

## 2. Validation
- [ ] 2.1 Run `npm run lint`.
- [ ] 2.2 Run existing Vitest suites (e.g., `npm run test` or equivalent) and confirm new tests pass.
