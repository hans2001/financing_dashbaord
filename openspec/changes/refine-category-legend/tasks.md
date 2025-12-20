## 1. Implementation
- [ ] 1.1 Introduce helper logic that limits the pie chart data to the top categories and optionally aggregates the remainder into an "Other" entry so the legend stays capped.
- [ ] 1.2 Update `CategoryPie`/`SummaryPanel` to use the capped data and ensure the legend always maps to the rendered segments; relax the panel's height class so additional legend rows remain visible.
- [ ] 1.3 Extend or add component tests that cover the capped/aggregated output so the legend helper continues to behave as expected.
