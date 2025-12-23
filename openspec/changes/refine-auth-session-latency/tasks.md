## 1. Implementation
- [ ] 1.1 Update auth session initialization to avoid Prisma access during session checks by dynamically importing the Prisma client only within credential verification.
- [ ] 1.2 Normalize NextAuth base URL handling for deployments and ensure the auth handler runs in the Node runtime.
- [ ] 1.3 Simplify login redirect handling so the session cookie is available before navigating to `/dashboard`.

## 2. Verification
- [ ] 2.1 Add a performance-focused test that asserts the credentials callback responds within 3 seconds on a cold start (documented, with a reasonable buffer for CI variance).
- [ ] 2.2 Run `npm test`.
- [ ] 2.3 Run `openspec validate refine-auth-session-latency --strict`.
