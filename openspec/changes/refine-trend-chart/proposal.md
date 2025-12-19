# Change: Refine trend visualization

## Why
The existing trend visualization is fragile—custom SVG paths leave the axis hard to read, the chart shows only daily deltas, and the right-hand column jumps in height whenever the user switches from the pie chart to the trend view. The right-hand column should stay focused on the highlights without shifting, and the trend panel needs a more readable, cumulative view that highlights how much was spent each day while still staying compact.

## What Changes
- Replace the hand-written SVG overlay with a well-supported charting library (e.g., `Recharts`) so we get polished axes, tooltips, and responsive layouts without extra plumbing.
- Feed the chart cumulative “spending” totals, but keep the tooltip focused on the day/amount pair so users see exactly how much was spent on each date while the line reflects the running total.
- Lock the summary tab pane to a fixed height (matching the pie view) so toggling between “Categories” and “Trend” never causes layout jumps.
- Keep the new chart focused on the spending data (drop the income line) and ensure the panel defaults to the “Categories” tab without compromising the compact tab controls added earlier.

## Impact
- Affected files: `components/dashboard/TrendLinePanel.tsx`, `components/dashboard/SummaryPanel.tsx`, `package.json`, `package-lock.json`
