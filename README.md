# Personal Finance Dashboard

This app gives Hans, Yuki, and anyone they invite a single pane that mixes Plaid-linked accounts, manual entries, and insight cards so every household transaction, balance, and trend lives in one place.

## Key features

- **Unified data** – merges Plaid accounts, manual overrides, and supplemental sources into a searchable, sortable transactions view with smart categorization helpers.
- **Insightful summaries** – balance snapshots, flow filters, trend indicators, and charts highlight how spending and income are behaving at a glance.
- **Ops-friendly workflows** – documented helpers (`refresh-demo-data`, `set-base-url`, etc.) keep demos fresh and onboarding fast while keeping Plaid production credentials at the core.

## Getting started

1. Copy `.env.example` to `.env.local`, fill in Plaid credentials (client ID, secret, webhook URL if used), `APP_BASE_URL`, `NEXTAUTH_SECRET`, and any database secrets. `PLAID_TRANSACTIONS_DAYS_REQUESTED` defaults to `730` but can be tuned before linking to request up to two years of history.
2. Install dependencies (`npm install`) and point Plaid Link at your local app via a secure tunnel (`ngrok http 3000`); update the base URL (`npm run set-base-url https://<tunnel>.ngrok.io`) and start the dev server (`npm run dev:no-hmr`).
3. Visit `/connect`, complete the Plaid flow, and return to `/dashboard`. Use the filters/insights panel to explore ranges, flow types, and sorting controls.

## Maintenance notes

- Keep `APP_BASE_URL` aligned with the tunnel URL so Plaid’s iframe can communicate with the app; rerun `npm run set-base-url` whenever the tunnel changes.
- To reset the demo account, run `npm run refresh-demo-data` and re-link via `/connect` so the latest accounts/transactions repopulate the dashboard.

See `TECHNICAL.md` for implementation details, setup, and additional commands.
