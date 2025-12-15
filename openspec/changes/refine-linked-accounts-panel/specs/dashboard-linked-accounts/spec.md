## ADDED Requirements
### Requirement: Linked accounts panel presents a compact, aligned header and rows
`components/dashboard/LinkedAccountsPanel` SHALL keep the header label, connected-count text, and the toggle/action on the same horizontal bar, while rendering each account row with tightly grouped metadata that stays legible even in dense states.

#### Scenario: Header text, counts, and toggle share one baseline
- **GIVEN** the dashboard renders with one or more linked accounts,
- **WHEN** the panel mounts,
- **THEN** the "Linked accounts" label SHALL appear next to the connected-count string (e.g., "(2 connected)") with subdued styling, and the "Details"/"Less" toggle SHALL live on the same row so the entire header reads as a single control area instead of three stacked lines.

#### Scenario: Account rows are tight but readable
- **GIVEN** visible accounts are shown,
- **WHEN** each row renders,
- **THEN** the account name SHALL dominate with bold/medium weight, the institution name, type, and timestamp SHALL appear in compact secondary text, and the layout SHRINKS vertical padding so multiple rows feel cohesive without sacrificing the stale indicator, balance numbers, or interaction affordances.
