## 1. Implementation
- [ ] 1.1 Add `next-auth` (or another session manager) plus a credentials provider backed by Prisma so we can issue HttpOnly `next-auth.session-token` cookies instead of shipping the family secret to every client bundle.
- [ ] 1.2 Extend `prisma/schema.prisma` (and add a migration/seed script) with the fields needed for credential verification (e.g., hashed password, optional role flag) so we can bootstrap a known family admin account.
- [ ] 1.3 Build the `/auth/login` page/route that collects email/password, calls `signIn`/`NextAuth`, surfaces validation errors, and redirects successful logins to `/dashboard`.
- [ ] 1.4 Turn `app/dashboard/page.tsx` into a server-side gate that uses `getServerSession(authOptions)` to redirect unauthenticated visitors to `/auth/login` before hydrating the existing client-side dashboard shell.
- [ ] 1.5 Update the shared helpers (`lib/server/session.ts` and any other utilities) so API routes call `getServerSession` instead of the shared header; ensure every `app/api/*` route rejects requests without a valid session and conveys clear 401/403 responses, while still honoring demo user fallbacks if appropriate.
- [ ] 1.6 Clean up `middleware.ts`/`FAMILY_AUTH_TOKEN` usage so we no longer bake secrets into the middleware stack (or reuse it only to refresh NextAuth cookies if guards require it).
- [ ] 1.7 Ensure the Plaid onboarding endpoints (`/api/plaid/create-link-token`, `/api/plaid/exchange-public-token`) verify the NextAuth session, tie any created `BankItem`/`Account` rows to `session.user.id`, and never return a `link_token` or exchange result to anonymous callers.
- [ ] 1.8 Teach the landing/connect UI (`app/page.tsx`, `/connect`, `PlaidConnectPanel`, `useLinkToken`) to surface a login prompt (and optionally redirect to `/auth/login`) when the link-token request is unauthorized so no Plaid flow runs for strangers.

## 2. Verification
- [ ] 2.1 Add tests (Vitest + supertest/next-test-api-route-handler) that assert `/auth/login` accepts valid credentials, that `/dashboard` rejects anonymous visitors, and that protected API routes return 401/403 without a session.
- [ ] 2.2 Run `npm test` (and relevant API/component suites) to ensure the new auth surface stays covered.
- [ ] 2.3 Run `openspec validate add-dashboard-session-auth --strict` once the spec/tasks are fully filled in.
