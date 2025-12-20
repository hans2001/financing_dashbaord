# Change: Refine category legend visibility

## Why
- The category pie chart legend is clipped when many slices are rendered, making it hard to read the top categories without scrolling or hunting through the table.
- Keeping every single category in the legend also competes for space with the rest of the summary panel, so  users lose context for the chart when the legend is truncated.

## What Changes
- Limit the pie chart slices/legend entries to the most impactful categories by normalizing the source totals, aggregating the remainder into a single “Other” slice so the legend stays short and consistent with the chart.
- Relax the summary panel’s fixed height so the category tab can grow as needed to render those legend entries without clipping.
- Add a regression test that exercises the aggregation logic so chart data stays in sync with the legend.

## Impact
- Affected specs: category-legend (new capability)
- Affected code: `components/dashboard/SummaryPanel.tsx`, `tests/components/dashboard/SummaryPanel.test.tsx`
