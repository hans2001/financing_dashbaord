# Change: Enforce RLS on public-facing schema tables

## Why
- Supabase reports (e.g., lint 0013) currently flag `public._prisma_migrations`, `public.User`, `public.BankItem`, `public.Account`, and `public.Transaction` as lacking row-level security even though the dashboard relies on authenticated users to scope the data. Before we ship or expose PostgREST endpoints for the project, we must harden the schema so the database enforces the same guarantees as the API.
- Enabling RLS establishes a security baseline that future integrations (e.g., Supabase clients, migrations, third-party dashboards) can build on without needing a trusted service credential for every read/write.

## What Changes
- **Spec**: Add a database-security capability that says all tables exposed to PostgREST (the dashboard tables plus Prisma metadata) must enable RLS and keep policies that restrict rows to the owning user.
- **Implementation**: Add a Prisma migration that enables RLS on the flagged tables and introduces policies allowing the owning user (based on `auth.uid()`) to read/write their rows while keeping `_prisma_migrations` locked down to service roles/migrations.
- **Docs**: Update the deployment/security guidance to remind engineers to keep these policies and RLS in sync.

## Impact
- Affected specs: `database-security`
- Affected code: `prisma/migrations/<timestamp>`, `docs/deployment-plan.md`, and any security guidance that mentions Supabase schema expectations
