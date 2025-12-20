## Context
- The current dashboard surface ships a shared `FAMILY_AUTH_TOKEN` to every browser bundle, meaning anybody who inspects the console automatically learns a bearer header that unlocks `/api/*` routes and the Plaid link flow.
- Plaid Link sessions are also unguarded, so visitors can obtain a `link_token` and get redirected to `/dashboard` even if they are not part of the family.
- The user story now explicitly requires that only Hans and Yuki can see or interact with the dashboard or trigger Plaid flows, which means we must replace the static secret with a proper credentials-based session guard.

## Goals / Non-Goals
- **Goals**
  - Introduce per-user authentication backed by Prisma so we can verify credentials, seed known accounts, and revoke access by disabling users.
  - Gate `/dashboard`, all supporting APIs, and the Plaid onboarding endpoints behind `getServerSession(authOptions)` so network traces never emit sensitive tokens and unauthorized callers always land on `/auth/login`.
  - Surface a login experience that accepts email/password, surfaces validation errors, and redirects successful sessions to `/dashboard`, plus a logout control for the dashboard UI.
  - Keep the Plaid connect UI usable for signed-in users while showing a login prompt when the link-token fetch is rejected.
- **Non-Goals**
  - Public self-service registration or invite flows (we seed accounts manually for the family).
  - Preserving the old `FAMILY_AUTH_TOKEN` usage beyond any temporary migration helpers; once sessions work we can remove the shared secret entirely.

## Decisions
- **Session stack:** Use `next-auth` with a credentials provider + `argon2` for hashing so we can verify an email/password pair stored in Prisma and reuse NextAuth’s middleware/session helpers.
- **Session shape:** Configure `session.strategy = "jwt"` and return `{ id, email, displayName }` so API routes can read `session.user.id`. Provide a shared helper `requireAuthenticatedSession()` (or similar) that wraps `getServerSession(authOptions)` and either returns the user payload or throws/returns a 401 `NextResponse`.
- **Dashboard gate:** Turn `app/dashboard/page.tsx` into a server component that calls `requireAuthenticatedSession()` and redirects unauthorized visitors before any client-side data loads. Move the existing client-heavy dashboard shell into a separate client component so we still access hooks and React state.
- **Plaid gate:** Update `/api/plaid/create-link-token` and `/api/plaid/exchange-public-token` to read the authenticated user ID, reject 401 responses without calling Plaid, and tie every created `BankItem`/`Account` row to that user. Teach `PlaidConnectPanel`/`useLinkToken` to detect authentication failures and point people to `/auth/login`.
- **Logout UI:** Add a simple client component (e.g., `LogoutButton`) inside the dashboard layout that calls NextAuth’s `signOut({ callbackUrl: "/auth/login" })`.
- **Prisma schema:** Extend `User` with `passwordHash String?`, `isActive Boolean @default(true)`, and optional `role String` (e.g., `"family"`). Provide a lightweight seed or script that reads `AUTH_DEFAULT_EMAIL`, `AUTH_DEFAULT_PASSWORD`, and `AUTH_DEFAULT_DISPLAY_NAME` (plus `NEXTAUTH_SECRET`) to bootstrap the first user.
- **Middleware:** Remove the cookie-setting `middleware.ts` in favor of NextAuth’s session cookie handling; rely on the server component + API checks for protection so we can keep the Plaid webhook public.

## Risks / Trade-offs
- Introducing NextAuth + `argon2` increases the dependency surface; we mitigate this by keeping the provider minimal (no OAuth) and limiting exposure to the credentials page and known envs.
- Existing tests rely on `authorizeRequest`; we’ll need to rewrite them to mock `getServerSession`, which adds some overhead but gives better fidelity to the new guard.
- Seeding credentials via env vars means deployments must provide matching secrets; we’ll document the required envs and provide a script so the family can manage them securely.

## Migration Plan
1. Update `prisma/schema.prisma` (and add a migration) to add `passwordHash`, `isActive`, and any other fields the credentials flow requires.
2. Add `env` checks and a small script (e.g., `scripts/create-initial-user.mjs`) that hashes `AUTH_DEFAULT_PASSWORD` with `argon2` and upserts the configured user before the dashboard loads.
3. Teach the test suite to mock `getServerSession` and adjust expectations for the new unauthorized paths.
4. Replace `FAMILY_AUTH_TOKEN` usages with the new session model, including the middleware, `PlaidConnectPanel`, and API routes.

## Open Questions
- Should we expose an admin UI for managing family credentials later, or do we prefer manual scripts for now?
- Do Hans and Yuki share a single account, or do they get separate logins? (For now we allow multiple Prisma users so future expansion is easier.)
