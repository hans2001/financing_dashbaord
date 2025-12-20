## 1. Implementation
- [x] 1.1 Update `SummaryPanel` to remove the tab controls, maintain the h-[16rem] container, and stack the category pie and trend line segments in a single scrolling column with consistent spacing.
- [x] 1.2 Ensure the pie legend grid still wraps cleanly and contains the capped set of entries (keep aggregation logic) while the chart area includes the `TrendLinePanel` below the pie so both visuals share the same height.
- [x] 1.3 Adjust `TrendLinePanel` or its consumers so the chart renders immediately when the dashboard loads (keep a fixed min-height to satisfy `ResponsiveContainer`), and mock/render the new combined layout in any necessary tests or stories.
- [x] 1.4 Add or update tests to cover the new SummaryPanel structure (verify the pie and trend sections render together and that the trace data is still being consumed correctly).
