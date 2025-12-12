# Security Hardening Plan

## Scope
This plan works through the concerns listed in `security/CONCERNS.md` without overlapping the active TODO backlog owned by another thread.

## Immediate Steps
1. **Stop shipping the dashboard secret to the browser**
   - Introduce a lightweight session cookie + middleware that injects `x-family-secret` on server-side fetches only.
   - Migrate dashboard data fetching to server routes or server actions so the client never needs the secret.
2. **Harden the secret itself**
   - Fail startup when `FAMILY_AUTH_TOKEN` is missing or too short.
   - Apply rate limiting before header validation, keyed by IP and secret combination.
3. **Restrict sync execution**
   - Require an admin-only credential (env or role) for `/api/transactions/sync` or move syncing to a background job triggered outside the browser.
4. **Establish proper sessions/CSRF defenses**
   - Adopt a real auth system (NextAuth/passkey) with HttpOnly cookies and CSRF tokens for dashboard forms.

## Tracking
For each concern we will:
- Create a dedicated PR/commit referencing the concern number.
- Update `security/CONCERNS.md` with mitigation status once merged.
