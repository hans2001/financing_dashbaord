## ADDED Requirements
### Requirement: Category filters derive their options from a time-range snapshot and support multi-selection
The dashboard SHALL populate the category picker/chips from a snapshot of every category that exists for the selected accounts and date range, rather than only from the subset that happens to be rendered inside the current transactions page, and it SHALL allow users to select multiple categories from that snapshot before applying the combined filter to the table.

#### Scenario: Snapshot-driven picker remains stable when a category is applied
- **GIVEN** the transactions API has returned a snapshot of categories for the current accounts/date range and the UI shows chips/dropdown derived from that list
- **WHEN** the user selects one category and the table re-renders with the filtered rows
- **THEN** the category picker options/chips MUST still include every category in the snapshot, not just the filtered ones, and the user MUST be able to switch to another category without losing the remaining options
- **AND** the snapshot request MUST ignore the current category filters so the same snapshot can drive all subsequent category changes

#### Scenario: Multi-category filter updates the table
- **GIVEN** the user selects two categories from the snapshot-driven picker
- **WHEN** the dashboard reloads the transactions data
- **THEN** the request to `/api/transactions` SHALL include both categories (e.g., repeated `category` query parameters), the backend SHALL filter with `where.normalizedCategory.in`, and the table SHALL show rows for both categories while the summary aggregates continue to honor that combination

#### Scenario: Chips stay in sync with multi-select state
- **WHEN** a user adds or removes a category via the chips or multiselect control
- **THEN** each chip SHALL reflect one of the selected categories, removing a chip SHALL decrement the applied set without collapsing the rest, and the chip strip SHALL persist even when the tray is collapsed or the table is paginated
- **AND** clearing all category chips SHALL reset the multi-category filter back to the default selection (e.g., no filter or `["all"]`)
