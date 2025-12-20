# Change: Stack summary charts

## Why
The current summary card toggles between the category pie and the trend line, which wastes space, introduces layout jumps, and leaves the trend view hidden until the user switches tabs. Placing both visualizations in a single, fixed-height column will keep the highlights visible together, eliminate the toggle overhead, and make the legend/grid layout easier to reason about.

## What Changes
- Replace the tabs inside `SummaryPanel` with a single scrollable column that first shows the pie/chart summary and then the trend line content so the chart is always visible.
- Keep the trend data container height fixed, preserve the legend grid, and ensure the pie/trend combination shares the same styling treatment used by the existing cards (borders, background, spacing).
- Adjust `TrendLinePanel` as needed so it renders cleanly inside the stacked layout (e.g., ensure it can collapse/expand without losing state or height) and update any dependent tests or stories.

## Impact
- Affected files: `components/dashboard/SummaryPanel.tsx`, `components/dashboard/TrendLinePanel.tsx`, `tests/components/dashboard/SummaryPanel.test.tsx`, `tests/components/dashboard/TrendLinePanel.test.tsx` (if needed)
