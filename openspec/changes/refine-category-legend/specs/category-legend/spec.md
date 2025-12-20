## ADDED Requirements
### Requirement: Lean category legend for summary chart
The finance dashboard SHALL cap the category summary legend to the most impactful slices so that the legend remains readable; when more slices exist than the cap allows the remaining values SHALL be aggregated into a single “Other” slice that appears in both the chart and the legend.

#### Scenario: Many categories are tracked
- **WHEN** the summary data exposes more categories than the legend cap (e.g., more than five slices)
- **THEN** the summary panel renders only the top categories plus a single “Other” entry whose value equals the sum of every remaining category
- **AND** each legend entry corresponds to exactly one donut slice so the chart and legend stay aligned

### Requirement: Summary card adapts to legend height
The category tab in the summary panel SHALL allow its height to expand beyond the original fixed size so the capped legend never clips; the user SHALL always be able to read every legend row without scrollbars or overflow artifacts.

#### Scenario: Legend needs extra rows
- **WHEN** the capped legend includes four rows and the card would have clipped them at the previous fixed height
- **THEN** the category tab expands vertically (e.g., via `min-height` + auto layout) so every legend entry is fully visible without overlapping the adjacent linked accounts panel
