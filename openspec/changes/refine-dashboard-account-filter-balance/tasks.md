## 1. Implementation
- [ ] 1.1 Surface the formatted balance for each account inside `AccountFilterSelect`, adding a secondary label in the dropdown rows and inside each selected pill so users can differentiate identical account names.
- [ ] 1.2 Ensure the dropdown rows remain accessible and the new balance text uses the shared currency formatter from `dashboard-utils` so the display stays consistent with the summary panel.
- [ ] 1.3 Update or add Vitest tests that assert the pills and dropdown rows show the balance string for each account and that removing accounts still works when the label includes the extra text.

## 2. Validation
- [ ] 2.1 Extend `openspec/changes/refine-dashboard-account-filter-balance/specs/dashboard-filtering/spec.md` with a requirement & scenario describing the balance display.
- [ ] 2.2 Run `openspec validate refine-dashboard-account-filter-balance --strict` after populating the spec/tests.
