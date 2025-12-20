## ADDED Requirements
### Requirement: Transactions table occupies dominant horizontal space
The dashboard layout SHALL prioritize the transactions table as the primary work surface on wide viewports.

#### Scenario: Table dominates on xl screens
- **GIVEN** the viewport is at least the xl breakpoint,
- **WHEN** the dashboard renders the overview layout,
- **THEN** the transactions table column SHALL occupy the majority of available horizontal space and the summary sidebar SHALL remain a compact complement.

#### Scenario: Wide viewports reduce unused gutters
- **GIVEN** the dashboard is displayed on a wide desktop,
- **WHEN** the main layout container is rendered,
- **THEN** the container SHALL expand beyond the previous default max width so the table uses more of the available horizontal space without removing responsive padding entirely.

### Requirement: Summary sidebar stays supplemental
The summary sidebar SHALL read as secondary to the table while preserving readability.

#### Scenario: Sidebar retains a compact footprint
- **GIVEN** the overview layout shows both the table and summary panels,
- **WHEN** the layout is at the xl breakpoint,
- **THEN** the summary sidebar SHALL keep a compact width and avoid expanding to match the table, maintaining a clear primary-secondary balance.
