# Change: Introduce session-based dashboard auth

## Why
- The dashboard currently authorizes every visit using a single shared token exposed across the client, which leaves the app vulnerable to leakage and XSS escalations (see `security/CONCERNS.md`).
- We need a user-centric session model that forces every visitor to prove their identity before seeing or touching family finance data while preserving the ability to track/rate-limit API calls per user.

## What Changes
- Introduce NextAuth (or a similar credentials-based session mechanism) backed by Prisma users so the team can manage per-user logins with hashed credentials, middleware guards, and logout flows.
- Replace the current `FAMILY_AUTH_TOKEN` header/cookie gating with a NextAuth session that `app/dashboard/page.tsx` and all `api/*` routes require; unauthorized requests redirect to `/auth/login` or return 403.
- Provide a `/auth/login` experience that lets an approved family member sign in, handles errors/redirects, and optionally seeds an initial user so the workflow works out of the box.

## Impact
- Affected specs: `dashboard-security`
- Affected code: `lib/family-auth.ts` (or its successor), `app/dashboard/page.tsx`, `app/api/*` routes, `app/auth`, NextAuth config, Prisma schema/migrations, relevant tests.
