# Technical Details

## Stack overview
- **Next.js** + React for the frontend experience (pages: landing, `/connect`, `/dashboard`).
- **Plaid production** for transaction ingestion; backend handles link token issuance, public token exchange, and transaction sync via Plaid’s APIs.
- **Prisma + Postgres** store users, bank items, accounts, and transactions with migration workflow under `prisma/`.
- **Tailwind CSS** for responsive cards, tables, and utility-first styling.

## Features
- `/api/plaid/create-link-token`: issues link tokens for the production flow.
- `/api/plaid/exchange-public-token`: swaps public tokens for access tokens, upserts Plaid items and accounts.
- `/api/transactions/sync`: fetches transactions from Plaid, upserts to Postgres, and reports sync metrics.
- `/api/accounts` and `/api/transactions`: provide filtered account/transaction data to the UI, with highest-level spending insights on `/dashboard`.
- `/dashboard`: filtering, pagination, selection, spending/income summaries, top categories, and a compact linked accounts panel.

## Getting started (dev / deployment)
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill keys (Plaid, Postgres, app base URL).
3. Run Prisma migrations: `npx prisma migrate dev`
4. Start dev server: `npm run dev`

## Environment variables
See the top of `README.md` for the required list of env vars.

## Commands
- `npm run dev` — starts Next.js dev server.
- `npm run build` — compiles the app for production.
- `npm run lint` — runs ESLint across the project.

## Next steps for production
1. Set real Plaid + Postgres credentials and run `npx prisma migrate deploy`.
2. Provision a Postgres database with a managed provider.
3. Deploy the app (Vercel, Render, etc.) and ensure env vars like `DATABASE_URL` and Plaid keys are set.
