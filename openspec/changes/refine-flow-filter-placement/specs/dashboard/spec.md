## ADDED Requirements
### Requirement: Flow toggles live inside the expanded filter tray
`FiltersPanel` SHALL render the `FLOW_FILTERS` options only within the expanded tray alongside the other detailed controls so they stay hidden when the panel is collapsed yet accessible when opened.

#### Scenario: Flow controls stay hidden until the tray opens
- **GIVEN** the dashboard renders with `areFiltersCollapsed` true and the detail tray collapsed,
- **WHEN** the user expands the tray,
- **THEN** the flow buttons SHALL appear in the first section of the tray above the standard selects, they SHALL remain grouped with the rest of the filters, and selecting an option SHALL call `setFlowFilter` and refresh the transactions without altering the gradient layout of the summary card.

#### Scenario: Expanded tray keeps flow controls tidy
- **GIVEN** the tray is open,
- **WHEN** the user toggles between flow options,
- **THEN** the detail sheet SHALL respect the same validation/resolver logic as the other controls, the button states SHALL show the active option, and closing the tray SHALL keep the last selection without layout shifts.

### Requirement: Active flow selections appear in the chip strip
`FilterChips` SHALL include an entry for the current flow filter whenever it differs from the default (All activity), allowing the chip to display its current label and to reset back to the default when removed.

#### Scenario: Flow chip removal resets to default
- **GIVEN** the user previously selected Spending only or Income only,
- **WHEN** the flow chip is visible and the user clicks its remove button,
- **THEN** `handleFlowFilterChange` SHALL be invoked with the default flow value, the chip SHALL disappear, and the dashboard SHALL display the resulting transaction set for all activity.
