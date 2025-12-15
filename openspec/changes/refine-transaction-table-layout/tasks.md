## 1. Implementation
- [ ] 1.1 Document the desired horizontal rhythm and trimming guidance for the transactions table under `transactions-table-density` so the spec captures which columns get fixed widths, which grow, and how the selection control stays separated from the date column.
- [ ] 1.2 Update `components/dashboard/TransactionsTable.tsx` to introduce column width specifications (`<colgroup>` or helper constants), consistent padding, and adjusted truncation/description wrappers so UX requests around spacing and legibility are satisfied.
- [ ] 1.3 Run `npm run lint` (and any lightweight verification) to confirm the new markup/type changes do not introduce errors.
