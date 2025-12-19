## ADDED Requirements
### Requirement: Category selector shows every snapshot category inside a shadcn-styled popover and feeds multi-selection state to `categoryFilters`
The dashboard SHALL present every normalized category returned by the snapshot endpoint for the current accounts/date range inside a dropdown-based selection using the existing shadcn/ui primitives (popover, button, checkbox). The selector SHALL ignore which categories are currently rendered in the table, and each choice SHALL immediately update the shared `categoryFilters` state so repeated `category` parameters drive the `/api/transactions`, `/summary`, and trend queries.

#### Scenario: Snapshot-driven selector stays complete while filters change
- **GIVEN** the snapshot endpoint returns every normalized category for the selected accounts/date range
- **WHEN** the user opens the category selector and toggles one or more options
- **THEN** every category from the snapshot MUST remain visible inside the popover (even if it disappears from the paginated table) and toggling the checkbox MUST propagate the normalized value into `categoryFilters` without collapsing or filtering the selector itself
- **AND** the selector SHALL use shadcn/ui components so the height/width stays consistent with the other filter controls in the tray

#### Scenario: Selector interacts with the filters tray without submitting forms
- **GIVEN** the filters tray is expanded and the category selector is collapsed by default
- **WHEN** the user clicks the selector trigger
- **THEN** a popover SHALL layer over the filters UI showing the multi-select grid with shadcn checkboxes, AND it SHALL close only when the user clicks outside or explicitly closes it (not when toggling a checkbox)

#### Scenario: Multi-category selection drives requests and chips
- **GIVEN** the user selects several categories from the snapshot-driven selector
- **WHEN** the dashboard reloads transactions/summary/trend data
- **THEN** each request SHALL include the repeated `category` query parameters (one per normalized category), the backend SHALL filter against `where.normalizedCategory.in`, and the aggregates/table rows SHALL reflect the combination while the chip strip in the filters header stays synced with the array state

#### Scenario: Clearing filters resets snapshots
- **WHEN** the user clears all category chips
- **THEN** the `categoryFilters` array SHALL reset to `[]`, the selector trigger SHALL read “All categories”, and subsequent snapshot queries SHALL continue returning the full palette for reuse
