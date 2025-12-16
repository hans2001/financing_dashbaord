## ADDED Requirements
### Requirement: Dashboard view selector shares the filter-row rhythm
The dashboard SHALL provide a compact view selector row that sits alongside or within the existing filter summary, uses the shared rounded-card styling, and lets the user swap between the primary Account view and any future dashboard views without breaking the overall visual rhythm.

#### Scenario: View toggle keeps the layout calm and reusable
- **WHEN** the dashboard renders, it MUST show the view selector as a single row of controls that mirrors the spacing/typography of the filter panel and stays horizontally aligned with the account picker/chip row.
- **THEN** selecting a different view only swaps the downstream content inside the main card, the selector row collapses (if needed) with the filters rather than occupying a full card, and it exposes the same state hooks that the filters already use so future filter-heavy views can reuse those props.

### Requirement: Accounts remain the dominant content and do not depend on saved filter state
The dashboard SHALL keep the attached accounts list front and center in the main card, updating only when the user changes the linked accounts themselves rather than the ephemeral filter state.

#### Scenario: Account list honors the attached set without extra filters
- **WHEN** the dashboard loads, the main card MUST render the selected account view (for now, the attached accounts) and not attempt to replay the inactive filter summary or view details as a separate panel.
- **THEN** any future view switch defined by the selector just replaces that content, the filters/tracking controls only appear as a lightweight single row or overlay, and removing the view selector or accounts should not require carrying extra filter state across renders.
