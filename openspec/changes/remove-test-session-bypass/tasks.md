## 1. Implementation
- [ ] 1.1 Update `lib/server/session.ts` so it no longer checks `NEXTAUTH_TEST_SESSION` but still honors `globalThis.__TEST_AUTH_SESSION` for automated tests.
- [ ] 1.2 Add a reusable test-session helper (default session + setters) and adjust `tests/setup.ts`, `tests/api-endpoints.test.ts`, `tests/api/transactions-trends.test.ts`, and `tests/lib/session.test.ts` to use it instead of manipulating the environment variable.
- [ ] 1.3 Run the relevant test suite and ensure the OpenSpec delta reflects the behavior so future audits understand we no longer rely on the env-based bypass.
