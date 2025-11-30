# Future iterations

- [ ] Add search functionality to the transactions table so users can quickly find merchants, names, or amounts across the selected date range.
- [ ] Implement a sort-by dropdown that lets users reorder transactions by date, amount, or merchant name while respecting the current filters.
- [ ] Add authentication that ensures only family members can access the dashboard.
- [ ] Pre-register Yuki and Hans accounts with proper roles so they can sign in without extra onboarding.
- [ ] Allow manual CRUD of supplemental transactions (e.g., Chinese accounts or other assets) so the dashboard can track every family movement.
- [ ] Automate tracking of Hans and Yuki’s assets/expenses so the dashboard reflects the complete household financial picture.
- [ ] Add a monthly trend line chart (date → spent) so momentum can be tracked without exporting data.
- [ ] Show a pie chart of spending by category to highlight where money is going at a glance.
- [ ] Include a description column on each transaction row to surface notes or context directly in the table.
- [ ] Protect `api/*` routes with at least a lightweight token/session so Plaid secrets aren’t freely callable in production.
- [ ] Add input validation/ownership checks for the transaction APIs before expanding beyond the demo user to prevent accidental data leaks.
- [ ] Introduce request throttling or caching on `/api/transactions` if the dashboard ends up exposed to larger traffic to avoid overloading Postgres.
