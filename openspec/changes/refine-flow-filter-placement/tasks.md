## 1. Implementation
- [ ] 1.1 Keep `FlowFilterControls` inside the expandable tray by placing it near the other detail inputs and not rendering it in the collapsed summary.
- [ ] 1.2 Pass `flowFilter`/`setFlowFilter` through `DashboardPage` → `FiltersPanel`, wire the component to update the shared state, and keep `FilterChips` in sync with the flow selection so removal resets to the default.
- [ ] 1.3 Ensure the summary card stays compact while collapsing/expanding, and the tray still validates inputs via the existing resolver as the flow controls toggle within the detail area.
- [ ] 1.4 Add/adjust unit tests for `FlowFilterControls` and `FilterChips` so they cover the relocated controls and chip behavior.
- [ ] 1.5 Run the relevant tests (component + integration) to confirm the new layout works and document any follow-up polish observed during validation.
