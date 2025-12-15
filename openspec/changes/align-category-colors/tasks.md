## 1. Implementation
- [ ] 1.1 Extend the dashboard color definitions to a palette that links normalized categories with badge classes and pie colors, and update helpers to return the new color metadata plus a professional fallback for unknown categories.
- [ ] 1.2 Update `TransactionsTable` so category badges read from the palette entry, ensuring the class names still work and the badge label stays accurate.
- [ ] 1.3 Update `SummaryPanel` so the pie segments and legend dots pull their colors from the palette, using the same normalized key logic; ensure the "Other" slice and any unexpected categories fall back gracefully.
- [ ] 1.4 (Optional) Add or adjust unit tests that exercise the new palette helpers to guard against regressions.

## 2. Verification
- [ ] 2.1 Run the dashboard component suite or at least `vitest run tests/components/dashboard` to surface any type or runtime mismatches introduced by the helper changes.
