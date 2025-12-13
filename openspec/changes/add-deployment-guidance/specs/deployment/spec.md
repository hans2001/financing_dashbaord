## ADDED Requirements
### Requirement: Supabase provisioning runbook
The system SHALL provide a stand-alone deployment runbook (`docs/deployment-plan.md`) that explains how to provision the Supabase project(s), configure the Postgres database, and keep the schema, seeds, secrets, and network policies in sync with the finance dashboard’s expectations using the lightest viable process. The runbook MUST list the exact steps for creating/choosing a Supabase project, running Prisma migrations (`npx prisma migrate deploy`), seeding demo data, enabling Row Level Security, and capturing the Supabase URL + keys for copy/paste into Vercel.

#### Scenario: Provision a new Supabase environment
- **WHEN** an operator follows the runbook using the Supabase dashboard or CLI
- **THEN** they can create the project, apply the Prisma migrations, seed reference data, confirm Row Level Security, and record the Supabase secrets needed for the Vercel environment settings without needing any extra tooling.

### Requirement: Vercel deployment pipeline documentation
The system SHALL specify how to configure Vercel for the Next.js dashboard including repository linking (or manual CLI deploys), build settings, and the minimal environment variables (Supabase URL + keys, `DATABASE_URL`, `NEXT_PUBLIC_APP_BASE_URL`). The documentation MUST describe the basic pre-deploy checks (`npm ci`, `npm run lint`, `npm run test` or `npm run test:smoke`) and outline both Git-connected and manual `vercel --prod` flows so family members can deploy with a short checklist.

#### Scenario: Deploy from the main branch
- **WHEN** a commit lands on `main`
- **THEN** Vercel executes the documented build flow (using the configured env vars), and after the maintainer runs the quick lint/test steps, the production deployment finishes with the dashboard reachable at the configured domain.

### Requirement: Deployment verification guidance
The system SHALL include simple verification activities (load the site, call `/api/transactions?limit=1`, confirm Supabase credentials) plus optional future improvements so each deployment can be validated quickly without enterprise tooling.

#### Scenario: Post-deploy verification
- **WHEN** a deployment finishes on Vercel
- **THEN** the team follows the documented smoke check (visit the dashboard, call the API) and only shares the URL once the manual verification succeeds.
