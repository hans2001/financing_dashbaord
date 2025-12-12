## 1. Implementation
- [ ] 1.1 Capture the prioritized filters/flows (account, date, flow) for the compact bar and define how collapsed/expanded states surface the remaining controls and chips.
- [ ] 1.2 Refactor `FiltersPanel` into smaller pieces: a compact filter summary, chip strip, and expandable detail tray that reuses the existing select/date inputs, plus helper hooks for normalization/validation.
- [ ] 1.3 Update `DashboardPage` to orchestrate the collapsible behavior (reuse `areFiltersCollapsed`), wire the chip interactions, and ensure `useDashboardState` still provides the necessary setters.
- [ ] 1.4 Add tests that assert the compact view renders the prioritized controls and chips, the collapse toggle preserves state, and clearing a chip resets the underlying filter.
- [ ] 1.5 Verify the new layout through manual UX review/storybook preview and note any follow-up polish (spacing/icons) before marking the change done.
