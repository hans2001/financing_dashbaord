## 1. Implementation
- [ ] 1.1 Author the critical API testing spec delta describing success/failure behaviors for the chosen routes and helpers.
- [ ] 1.2 Extend `tests/test-utils/mocks.ts` to support `prisma.$queryRaw` so the trends route can be driven deterministically.
- [ ] 1.3 Add Vitest suites that cover `lib/auth`, `lib/plaid`, and `lib/server/session`, including their environment-guarding logic.
- [ ] 1.4 Add Vitest suites for `app/api/plaid/link-error` and `app/api/transactions/trends` that exercise unauthorized, filter, and happy-path flows.
- [ ] 1.5 Run the necessary tests/validations to ensure the new suites load cleanly and report the expected responses.
- [ ] 1.6 Add tests covering the protected transactions, summary, categories, sync, transaction description, and family-member routes to assert they short-circuit with `unauthorizedResponse()` when no session exists so unauthorized callers cannot jailbreak into dashboard data.
