## ADDED Requirements
### Requirement: Dashboard summary data is aggregated in the database
The `/api/transactions/summary` endpoint SHALL let PostgreSQL compute totalling, counting, and category aggregation instead of materializing every matching transaction inside the Node process.

#### Scenario: Totals for a large date range
- **GIVEN** a date range that matches tens of thousands of transactions
- **WHEN** the summary endpoint is invoked
- **THEN** the response SHALL contain the same `totalSpent`, `totalIncome`, `largestExpense`, `largestIncome`, `spendCount`, `incomeCount`, and category totals as before without the server loading every row (i.e., totals are computed via aggregated queries), and
- **THEN** the endpoint SHALL honor filters such as `accountId`, `startDate`, `endDate`, and `category` in those aggregated queries.

### Requirement: Currency formatting reuses a cached formatter
`formatCurrency` SHALL reuse a single `Intl.NumberFormat` instance so that rendering hundreds of transactions in the dashboard does not allocate a new formatter per row.

#### Scenario: Dense transaction renders
- **GIVEN** a transactions table rendering at least a few hundred rows
- **WHEN** each row calls `formatCurrency(tx.amount)` and the summary card renders its totals
- **THEN** they SHALL all call into the same cached formatter so CPU/memory do not spike while the table re-renders repeatedly.
