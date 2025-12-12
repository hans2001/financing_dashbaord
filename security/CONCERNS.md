# Dashboard Security Concerns

| # | Concern | Description | Impact | Proposed Mitigation | Status |
|---|---------|-------------|--------|---------------------|--------|
| 1 | Shared secret exposed to browser bundle | `components/dashboard/dashboard-utils.ts` exports `FAMILY_AUTH_HEADERS` using `process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN`, so every client gets the API secret and can call privileged routes directly. | Any visitor (or injected script) can read accounts/transactions and trigger sync jobs, defeating the intention of protected APIs. | Replace the token with a real authenticated session (e.g., NextAuth/passkey) or, short-term, proxy dashboard data fetching through server components/API routes that inject the secret serverside, never shipping it to the client. | Mitigated via `middleware.ts` + HttpOnly cookie injection (secret never resides in client JS) |
| 2 | Weak default secret | `lib/family-auth.ts` falls back to `family-dashboard-secret` if env vars are missing, meaning a misconfigured deployment is instantly guessable. | Accidental exposure in staging/prod would leak all data. | Fail hard when the env var is missing; optionally enforce minimum entropy/length. | Mitigated in `lib/family-auth.ts` (env is now mandatory + minimum length enforced) |
| 3 | Rate limiting only applies to valid secrets | `authorizeRequest` calls `consumeRateLimit` *after* validating the header, so attackers can brute-force the secret without hitting limits. | Enables online brute-force of the secret even if we tighten the value. | Track attempts per IP + per header and reject after repeated failures even when the secret is wrong. | Mitigated in `lib/family-auth.ts` (rate limit now keyed by client IP before validation) |
| 4 | Sync endpoint callable from the browser | `components/dashboard/hooks/useSyncControls.ts` lets any logged-in browser smash the `/api/transactions/sync` route, which reaches Plaid and database writes. | Malicious/compromised clients could spam sync requests causing rate-limit/cost issues or tamper with data freshness. | Restrict sync to server-side jobs or require a second, server-only credential + role check before executing. | Open |
| 5 | Missing anti-CSRF/session boundaries | Because auth boils down to a static header, a malicious script (XSS) or leaked bundle automatically grants API access without additional checks. | Amplifies impact of any front-end compromise; no per-user audit trail. | Move to cookie-based session tokens with HttpOnly/SameSite=Strict cookies tied to actual users. | Open |

## Prioritization
1. Stop shipping the family secret to the client (Concern #1) – prerequisite for all other hardening.
2. Remove the weak fallback and improve rate limiting (Concerns #2 and #3).
3. Lock down sync access (Concern #4).
4. Introduce real sessions and CSRF protections (Concern #5).
