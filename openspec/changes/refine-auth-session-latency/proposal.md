# Change: Reduce auth session latency on deployments

## Why
- Auth session initialization and login redirects are slow on deployments, especially on cold starts, which creates a poor sign-in experience.
- The current auth flow initializes Prisma on every session check, increasing cold start latency even when no database lookup is required.

## What Changes
- Defer Prisma initialization to credentials verification so `getServerSession` does not touch the database for normal session reads.
- Pin NextAuth route handling to a Node runtime path and normalize the base URL so cookies/redirects are reliable on deployments.
- Add a performance test that asserts the login callback responds within a reasonable latency budget on cold starts.

## Impact
- Affected specs: `dashboard-security` (new delta)
- Affected code: `lib/auth.ts`, `lib/server/session.ts`, `app/api/auth/[...nextauth]/route.ts`, test suite
