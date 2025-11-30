# Personal Finance Dashboard

A Next.js + Plaid + Prisma stack that lets a single user connect a Plaid sandbox item, persist accounts/transactions in Postgres, and explore spending intelligence on a simple dashboard.

## Features

- Plaid Link integration powered by the [`react-plaid-link`](https://github.com/plaid/react-plaid-link) package.
- Prisma + Postgres schema covering `User`, `BankItem`, `Account`, and `Transaction`.
- API routes (`app/api/*`) for creating link tokens, exchanging public tokens, syncing transactions, and surfacing accounts/transactions to the UI.
- Three pages: home landing, `/connect` for Plaid Link, and `/dashboard` for accounts, transactions, filters, category breakdowns, and a manual sync button.
- Tailwind CSS comfortably styles the UI with responsive cards and tables.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` (or `.env`) and fill in real credentials once you have them from Plaid/Vercel/your Postgres provider.
3. Create the database schema (requires a reachable Postgres instance):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Environment variables

| Key | Purpose |
| --- | ------- |
| `PLAID_ENV` | Plaid environment (`sandbox`, `development`, `production`). |
| `PLAID_CLIENT_ID` | Plaid client ID for the chosen environment. |
| `PLAID_SECRET` | Plaid secret for the chosen environment. |
| `NEXT_PUBLIC_PLAID_ENV` | Mirrors `PLAID_ENV` so the browser knows which environment Link targets. |
| `NEXT_PUBLIC_APP_NAME` | Used when creating the Plaid link token. |
| `DATABASE_URL` | Full Postgres connection string consumed by Prisma. |
| `APP_BASE_URL` | Base URL for the app (default `http://localhost:3000`). |

Secrets should only live in `.env.local` or Vercel dashboard variables. The repo already ignores `.env*`.

## Database / Prisma

- Prisma schema: `prisma/schema.prisma` defines the models you need to capture Plaid items, accounts, and transactions.
- Manual migration is stored under `prisma/migrations/20250101000000_init/migration.sql`.
- After updating the schema, run:
  ```bash
  npx prisma migrate dev
  ```
  or, for production deployments:
  ```bash
  npx prisma migrate deploy
  ```
- `lib/prisma.ts` exposes a singleton client; use it in route handlers to avoid reconnect storms.

## API routes

- `POST /api/plaid/create-link-token`: ensures a demo user exists, calls `linkTokenCreate`, and returns `link_token`.
- `POST /api/plaid/exchange-public-token`: accepts a `public_token`, swaps it for an access token, saves the Plaid item, and upserts associated accounts.
- `POST /api/transactions/sync`: fetches transactions for all or a specific bank item, upserts them, and returns a `{ fetched, inserted, updated }` summary.
- `GET /api/accounts`: returns each account joined with its bank item name.
- `GET /api/transactions`: supports filters (`accountId`, `startDate`, `endDate`, pagination) and returns the most recent transactions for the demo user.
- `POST /api/plaid/webhook`: placeholder that logs incoming Plaid webhooks.

No route ever returns an access token. The client only ever sees aggregated data.

## Frontend flow

- `/` landing: hero copy, buttons to `/connect` (Plaid Link) and `/dashboard`.
- `/connect`: fetches a link token, renders Plaid Link, guides sandbox logins (`user_good`, `pass_good`, `1234` for 2FA), exchanges public tokens, and redirects to `/dashboard`.
- `/dashboard`: fetches accounts and transactions, allows filtering by account/date, displays the transactions table, shows a spending summary with top categories, and exposes a “Sync latest transactions” button that re-runs the `/api/transactions/sync` flow and refreshes data.

## Plaid Sandbox tips

- Sandbox credentials:
  - Username: `user_good`
  - Password: `pass_good`
  - 2FA (when prompted): `1234`
- Link products: `["transactions"]`
- Country codes: `["US"]`
- Language: `en`

You can reuse the sandbox credentials for every test item; the backend will upsert the item/account/transaction records so you can pepper `/dashboard` with real data.

## Commands

- `npm run dev`: start Next.js dev server on `http://localhost:3000`.
- `npm run build`: compile the app for production.
- `npm run lint`: run ESLint across the project.

## Next steps

1. Wire the provided Plaid Sandbox keys + Postgres connection string via `.env.local`.
2. Run the migration command once to prepare your database.
3. Connect an account via `/connect` and hit “Sync latest transactions” from `/dashboard`.

If you need additional environment variables (e.g., Plaid webhooks, staging vs. production keys), list them and keep them in your secrets manager or `.env` derivatives, not in Git.
