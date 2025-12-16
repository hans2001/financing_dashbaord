## 1. Implementation
- [ ] 1.1 Update `lib/transaction-category.ts` so the override rules scan both `merchantName` and `name`, then add keywords for the merchants described in the task (rewards statement text, campus merchants, local restaurants, and transfer descriptions).
- [ ] 1.2 Ensure any normalized labels produced by the heuristics map to defined palette entries in `components/dashboard/dashboard-utils.ts`; add missing badge entries if new labels are introduced.
- [ ] 1.3 Write targeted unit tests under `tests/` to cover the new override behaviors so we guard against regressions.

## 2. Validation
- [ ] 2.1 Run the relevant Vitest suites (at least the new test file) to confirm the rules behave as expected.
