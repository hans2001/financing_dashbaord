## ADDED Requirements
### Requirement: Virtualized transactions rendering
`TransactionsTable` SHALL render only the rows that are visible inside the scrollable viewport so the DOM size stays bounded even when the filter/pagination query returns hundreds of transactions.

#### Scenario: Visible rows drive DOM size
- **GIVEN** the data layer returns dozens or hundreds of transactions for the requested range,
- **WHEN** the dashboard renders the transactions table,
- **THEN** it SHALL only instantiate DOM nodes for the rows that are currently in view, keeping the header, pagination controls, and selection logic unchanged.

#### Scenario: Selection and description editing continue to work
- **GIVEN** virtualization keeps hidden rows out of the DOM,
- **WHEN** a user toggles a checkbox or edits a description for a visible row,
- **THEN** the selection state, description save handler, and `TransactionsTable` callbacks SHALL still update the correct transactions without duplicating the DOM nodes for the non-visible rows.

#### Scenario: Pagination and filters continue to control the viewport
- **GIVEN** the filters/pagination controls request a different page or sort order,
- **WHEN** the table updates,
- **THEN** the virtualization layer SHALL reset to show the new visible rows from the updated dataset while keeping the checkbox-per-row alignment and the header text stable.
