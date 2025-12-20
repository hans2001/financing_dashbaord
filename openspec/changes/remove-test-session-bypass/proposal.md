# Change: Remove test session bypass

## Why
- The `NEXTAUTH_TEST_SESSION` environment shortcut lets local runs pretend to be authenticated, but it can mask real-world regressions and causes FK violations when the fake user is never persisted in the database (like the bank item upsert error we just saw).
- We already seed an actual demo user, so the dashboard and its APIs should rely on the recorded session rather than a brittle env string that is easy to misconfigure and never guaranteed to exist.

## What Changes
- Stop reading `NEXTAUTH_TEST_SESSION` when determining whether a request is authenticated, and instead keep only the in-process `globalThis.__TEST_AUTH_SESSION` hook that tests can opt into.
- Update the Vitest setup and every test that used `NEXTAUTH_TEST_SESSION` so they explicitly set or clear the test session via a shared helper before invoking the APIs.
- Harden the OpenSpec dashboard-security requirements to call out that only real NextAuth sessions (or explicit test hooks) can unlock the dashboard and data APIs.

## Impact
- Affected specs: `dashboard-security`
- Affected code: `lib/server/session.ts`, `tests/setup.ts`, all tests that touched `NEXTAUTH_TEST_SESSION`, new `tests/test-utils/test-session.ts`
