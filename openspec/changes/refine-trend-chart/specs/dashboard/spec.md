## ADDED Requirements
### Requirement: Trend panel surface shows cumulative spending with clear axes
The trend view SHALL render a single continuous line representing the running total of spending over the requested date range, keeping income off the chart to keep the focus on outflows.

#### Scenario: Cumulative line respects bucket order and scales to container
- **GIVEN** the trend buckets arrive ordered by date and include one spent value per bucket
- **WHEN** the chart renders
- **THEN** each point SHALL reflect the cumulative sum of the `spent` values up to that day, the horizontal axis SHALL label the bucket dates without truncating labels, and the vertical axis SHALL show currency-formatted ticks so the panel stays legible even on smaller screens

### Requirement: Tooltip emphasizes the day and amount spent on hover
- **GIVEN** the user hovers any point on the trend line
- **THEN** a tooltip SHALL appear showing the formatted bucket date and the raw amount spent that day (not the cumulative total) so the user can associate each point with how much they spent on that day
- **AND** the tooltip SHALL align with the hover point without forcing a layout shift or covering other UI elements

### Requirement: Trend content matches the pie panel’s size
- **GIVEN** the dashboard renders the summary tabs
- **WHEN** the user switches between “Categories” and “Trend”
- **THEN** the tabs’ containers SHALL stay the same width/height so the surrounding layout never jumps, and the chart section SHALL also preserve its height so the tab change feels instant
