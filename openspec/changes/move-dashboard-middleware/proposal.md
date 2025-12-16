# Change: Ensure dashboard routes set the family cookie via middleware

## Why
`proxy.ts` currently holds the logic needed to keep `__Secure-family-secret` in sync with dashboard visits, but it is not wired into Next's middleware pipeline so tabs under `/dashboard` never benefit. Moving this logic into `middleware.ts` makes the protected cookie adoption automatic and keeps the secret strictly on the server.

## What Changes
- Rename `proxy.ts` into `middleware.ts` at the project root so Next.js automatically executes the handler.
- Update the exported entry-point to use Next's middleware signature while keeping the existing matcher and cookie behavior.
- Document the new requirement via the OpenSpec workflow so future changes continue to honor the secure cookie.

## Impact
- Affected specs: none (new capability recorded under `dashboard-security`)
- Affected code: `proxy.ts` → `middleware.ts`
