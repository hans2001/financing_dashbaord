## 1. Implementation
- [ ] 1.1 Add a focused account multi-select component (with compact tags and a thermostat-friendly panel) that renders inside the filters card and exposes `selectedAccounts` + setter hooks.
- [ ] 1.2 Wire the component into `FiltersPanel` so it fits between the summary row and chips row, pass `accounts`/`selectedAccounts` from `DashboardPage`, and keep the sync button and collapsible tray unchanged.
- [ ] 1.3 Ensure the selection logic maps empty or full selections back to the `"all"` sentinel, keeps pagination reset semantics, and derives chip/tag labels from the latest account metadata.
- [ ] 1.4 Cover the new component and its helpers with Vitest tests that assert tags, selection toggles, and the `"all accounts"` fallback, and add a regression test that the transaction query parameters include every selected account ID.

## 2. Validation
- [ ] 2.1 Draft `openspec/changes/refine-dashboard-account-filter/specs/dashboard-filtering/spec.md` describing the new filtering requirements and scenarios.
- [ ] 2.2 Run `openspec validate refine-dashboard-account-filter --strict` once the spec and tasks are updated.
