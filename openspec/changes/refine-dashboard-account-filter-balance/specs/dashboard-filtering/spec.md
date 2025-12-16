## MODIFIED Requirements
### Requirement: Dashboard filters expose a compact account multi-select
The dashboard SHALL surface a dedicated multi-select control for linked accounts inside the filter summary card so that users can scope the transactions table without leaving the primary filter row.

#### Scenario: Multi-select sits inside the filters card without extra cards
- **WHEN** the dashboard renders, the filters card MUST show the date summary, the account multi-select control, and the chip row stacked vertically inside the same rounded container
- **THEN** toggling the filter collapse/expand state MUST leave the account control visible, the control MUST display a small label or badge for each selected account, and opening the multi-select menu MUST reveal every linked account with checkboxes (plus an “All accounts” affordance) so selections can be updated inline

### Requirement: Account tags remain compact and descriptive
Each selected account SHALL be shown as a compact pill inside the filter control so the panel stays tight and the selections remain visible even when several accounts are active.

#### Scenario: Tags describe the current account filter
- **WHEN** multiple accounts are selected, the control MUST render an inline list of pills capped to the available horizontal space (e.g., by showing the first few account names and a `+N more` indicator) while maintaining legible typography and padding
- **THEN** each pill MUST truncate long names gracefully, have a visible remove affordance to deselect that account, and the control MUST fall back to a single “All accounts” pill when every linked account is selected

### Requirement: Account filters show per-account balances
The account multi-select SHALL render each account’s formatted balance near its name (both inside the dropdown rows and inside the selected pills) so users can distinguish between identically named accounts.

#### Scenario: Balance labels clarify selections
- **WHEN** the user looks at the account dropdown or the pill strip and there are multiple accounts with the same display name,
- **THEN** each entry MUST include the same `formatBalanceValue` output used elsewhere in the dashboard so the balance appears as `$X,XXX.XX` next to the account name, and the chips/dropdown rows MUST continue to support removal/show-all interactions without layout regressions
