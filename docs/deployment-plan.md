# Deployment Plan

A lightweight deployment checklist for this family dashboard. We keep the flow simple: prepare Supabase, set environment variables, run migrations/tests, and push to Vercel.

## Goals

- Keep Supabase schema/data aligned with the app without over-engineering.
- Deploy the Next.js dashboard on Vercel with predictable settings.
- Run a quick smoke test so we know production works before sharing with family.

## Source of Truth

- **Supabase project** – Postgres database, RLS, API keys, backups.
- **Vercel project** – Hosting + environment variables.
- **Repository** – Prisma migrations (`/prisma/migrations`), scripts (`/scripts`), tests (`/tests`).

## Deployment Workflow

1. **Prep Supabase**
   - Create or select the Supabase project (one per environment is enough for now).
   - Set the database password and copy the connection string.
   - Run migrations: `DATABASE_URL="postgres://..." npx prisma migrate deploy`.
   - Seed demo/baseline data if needed (`node scripts/refresh-bank-items.mjs`).
   - Ensure Row Level Security is ON for the tables we expose.

2. **Configure Vercel env vars**
   - In the Vercel dashboard → Project Settings → Environment Variables, add:
     - `DATABASE_URL` (encrypted, server only)
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (server only)
     - `NEXT_PUBLIC_APP_BASE_URL`
   - Repeat for both Preview and Production scopes so preview URLs work.

3. **Local checks before deploying**
   - Install deps: `npm ci`.
   - Run `npm run lint` and `npm run test` (or a slim smoke test once we add `npm run test:smoke`).
   - Verify `.env` matches the values entered in Vercel.

4. **Deploy with Vercel**
   - Option A (recommended): connect the GitHub repo to Vercel and set `main` as the Production Branch. Pushing to `main` will trigger a build automatically.
   - Option B: deploy manually from the CLI.
     ```bash
     vercel --prod
     ```
   - Vercel runs `npm run build` and publishes the output at the production URL.

5. **Post-deploy check**
   - Hit the production site and confirm the dashboard loads and transactions appear.
   - Call `/api/transactions?limit=1` (via browser or curl) to make sure Supabase credentials work.
   - Share the URL with family once the manual smoke check passes.

## Future Improvements (optional)

If we outgrow the current setup, consider:
- Adding a GitHub Action to run migrations/tests automatically before triggering Vercel.
- Writing a small script to sync Supabase keys into Vercel/GitHub secrets when they rotate.
- Capturing Supabase + Vercel configuration in IaC (Supabase CLI, Terraform, or Pulumi) for easier rebuilds.
