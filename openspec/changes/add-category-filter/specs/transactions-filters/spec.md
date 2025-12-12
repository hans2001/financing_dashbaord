## ADDED Requirements
### Requirement: Filter transactions by normalized category
The dashboard SHALL allow users to select a normalized spend/income category so that only transactions belonging to that category are displayed, summarized, and exported.

#### Scenario: User narrows table to a category
- **GIVEN** the dashboard has loaded categories from existing transaction data
- **WHEN** the user selects a category from the filter controls
- **THEN** the transactions table, summaries, and pagination update to show only rows whose normalized category matches the selection
- **AND** the request to `/api/transactions` includes the selected category as a query/filter parameter

#### Scenario: User clears the category filter
- **GIVEN** a category filter is active
- **WHEN** the user resets or selects "All categories"
- **THEN** the dashboard removes the filter, refetches all transactions, and pagination resets to the first page
