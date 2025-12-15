## 1. Implementation
- [ ] 1.1 Extend `dashboard-utils.ts` with a status palette and helper that exports background/text/border classes plus a display label for each status.
- [ ] 1.2 Update `TransactionsTable.tsx` to use the helper-rendered badge instead of the hard-coded spans so pending and posted remain transactions table badges in the same style.
- [ ] 1.3 Run targeted dashboard tests or linting to confirm no runtime/style regressions.

## 2. Verification
- [ ] 2.1 Run `npm test -- tests/components/dashboard` to ensure the component suite still passes.
