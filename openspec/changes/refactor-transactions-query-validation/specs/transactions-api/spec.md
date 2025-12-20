## ADDED Requirements
### Requirement: Transactions query validation
The transactions API endpoints SHALL validate `startDate` and `endDate` query parameters as ISO dates in `YYYY-MM-DD` format and respond with HTTP 400 when invalid.

#### Scenario: Invalid date rejected
- **WHEN** a client requests `/api/transactions` with `startDate` or `endDate` that is not a valid `YYYY-MM-DD` date
- **THEN** the server responds with HTTP 400 and an error message

### Requirement: Consistent filter parsing
The transactions API endpoints SHALL apply the same account, category, and date filtering rules for list, summary, trends, and categories queries.

#### Scenario: Shared filters applied
- **WHEN** a client supplies account and category filters
- **THEN** each endpoint returns results filtered by the same validated account and category criteria
