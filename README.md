# Personal Finance Dashboard

This dashboard helps Hans and Yuki keep every household transaction and asset under one roof. It’s designed to:

- Surface spending and income trends across linked financial accounts,
- Make it easy to compare balance/activity in one place (saving the need to hop between bank portals),
- Offer actionable insights (top categories, averages, linked accounts) so the family stays ahead of their budget.

By syncing Plaid data and enabling manual tracking for supplemental sources, the app becomes a single source of truth for family finances (expenses, earners, and cross-border accounts). It now relies on Plaid production credentials so the dashboard reflects real balances and transactions.

See `TECHNICAL.md` for implementation details, setup, and commands.

## Local HTTPS with Plaid
1. Start an HTTPS tunnel (e.g., `ngrok http 3000`) and copy the generated `https://...` URL.
2. Run `npm run set-base-url https://your-tunnel.ngrok.io` so `APP_BASE_URL` (in `.env.local` / `.env`) matches the origin Plaid Link will open.
3. Use that HTTPS URL in your browser when opening `/connect`, and start the dev server with HMR disabled (`npm run dev:no-hmr`) to avoid websocket proxy failures. If you still want hot reload, tunnel through ngrok with `ngrok http 3000 --host-header="localhost:3000"` so the websocket upgrades survive.

Keeping `APP_BASE_URL` in sync avoids the fullscreen/protocol errors when Plaid’s iframe tries to talk to your app. Repeat step 2 whenever your tunnel URL changes.

## Resetting demo data
Run `npm run refresh-demo-data` to wipe the demo user's bank items, accounts, and transactions. Re-linking via `/connect` will repopulate the tables with the latest production access token and account data.
