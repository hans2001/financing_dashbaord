## ADDED Requirements
### Requirement: Dense transaction table shell
`TransactionsTable` SHALL adopt a tighter visual rhythm so more rows fit inside the dashboard card without touching the filter controls.

#### Scenario: Rows occupy less vertical real estate
- **GIVEN** the table renders inside the existing `flex` card beneath `FiltersPanel`,
- **WHEN** data arrives, it SHALL render the same columns in a reduced-height row (smaller font/padding) and keep the column structure stable,
- **THEN** the leaderboard will display more transactions before hitting the footer/pagination area.

#### Scenario: Header stays legible even when compacted
- **GIVEN** the column labels currently use uppercase styling,
- **WHEN** the table shrinks the text/padding,
- **THEN** the header text SHALL remain readable by keeping the tracking and uppercase cues while trimming padding and height.

#### Scenario: Density respects responsive needs
- **GIVEN** the dashboard runs at both desktop and smaller breakpoints,
- **WHEN** the viewport narrows,
- **THEN** the compact styling SHALL still allow horizontal scrolling without clipping checkboxes, category badges, or inline description editors, and vertical row height should never collapse under 32px.

#### Scenario: Functional helpers continue running unchanged
- **GIVEN** `DescriptionEditor`, pagination, and selection toggles rely on existing callbacks,
- **WHEN** the UI compacts,
- **THEN** it SHALL keep the same data hooks and still wrap descriptions in `DescriptionEditor` so no behavioral regression occurs.

#### Scenario: Category badges stay readable while shrinking
- **GIVEN** the table now leans into a compact rhythm,
- **WHEN** the category badge renders inside each row,
- **THEN** it SHALL shrink its padding/typography just enough to reduce height without dropping the uppercase label or breaking the outline.

#### Scenario: Status column remains accessible
- **GIVEN** users rely on `Pending` vs `Posted` for activity state,
- **WHEN** the compact table renders,
- **THEN** the status column SHALL stay in its original place between the date and account columns so the timeline context remains visible even as other cells shrink.

#### Scenario: Documentation captures the density decision
- **GIVEN** the project-wide rule to document designs,
- **WHEN** this UI change ships,
- **THEN** `docs/transactions-table-compact.md` SHALL describe the motivation, constraints, and how the compact layout works so future agents understand the intent.
