# Future iterations

- [x] Implement a sort-by dropdown that lets users reorder transactions by date, amount, or merchant name while respecting the current filters.
- [x] Add authentication that ensures only family members can access the dashboard.
- [ ] Pre-register Yuki and Hans accounts with proper roles so they can sign in without extra onboarding.
- [x] filter to show spending only or inflow only for transaction table.
- [ ] Allow manual CRUD of supplemental transactions (e.g., attache to new accounts(can self open)) so the dashboard can track (famiy assets oversees).
- [ ] Add a monthly trend line chart (date → spent) so momentum can be tracked without exporting data.
- [x] Show a pie chart of spending by category to highlight where money is going at a glance.
- [x] Include a description column on each transaction row to surface notes or context directly in the table. (default null) (optional field)
- [ ] Treat pending credit-card charges as temporary (excluding them from summaries until they post) or automatically net them with the checking account debit so the dashboard mirrors real-world cash flow.
- [ ] address all security concerns( cannot let random people to be able to view our dashboard ) (auth system in place)
- [x] Protect `api/*` routes with at least a lightweight token/session so Plaid secrets aren’t freely callable in production.
- [x] Add input validation/ownership checks for the transaction APIs before expanding beyond the demo user to prevent accidental data leaks.
- [x] Introduce request throttling or caching on `/api/transactions` if the dashboard ends up exposed to larger traffic to avoid overloading Postgres.
