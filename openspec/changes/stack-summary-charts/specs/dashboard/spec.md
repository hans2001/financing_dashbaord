## MODIFIED Requirements
### Requirement: Summary panel shows the category pie and trend line in separate stacked grid cards
The summary column SHALL render the top category pie/legend inside one card row and the trend line inside a distinct card row beneath it so both visuals stay visible simultaneously without sharing the same parent container.

#### Scenario: Category card sits above the trend card inside the fixed-height column
- **GIVEN** the dashboard renders the summary column inside the overview layout
- **WHEN** there is category and trend data to display
- **THEN** the column SHALL use a grid with two rows (the first for the category card, the second for the trend card), each row keeping the shared rounded border / background treatment, and the overall container SHALL remain at the same `h-[16rem]` height so layout shifts never occur
- **AND** the trend card SHALL occupy its own grid row with a dedicated min-height so the chart never needs a tab switch to draw

### Requirement: Trend data stays visible immediately
The trend view SHALL render inside its secondary card with a fixed minimum height and no delayed mounting so it can respond to data changes even when the category data has not changed.

#### Scenario: Trend data keeps its height inside the stacked layout
- **GIVEN** the cumulative trend data is fetched at dashboard load
- **WHEN** the component renders
- **THEN** the `TrendLinePanel` appears inside its own card row below the pie card, maintains its min-height so `ResponsiveContainer` can measure it, and the cumulative line with tooltip renders immediately without requiring a tab switch
