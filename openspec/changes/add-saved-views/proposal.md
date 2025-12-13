# Change: Add Saved Views and Workspaces

## Why
Hans and Yuki want a way to persist their preferred account selections, filter combinations, and column layouts so they can jump back into their favorite perspectives without fiddling with the dashboard controls every time. A shared "family view" that always shows every linked account plus each users favorite tweaks would reduce onboarding friction when the household reviews balances together.

## What Changes
- **BREAKING** Add a `SavedView` model to the Prisma schema to persist view definitions (filters, columns, sorting, page size) tied to a user and an optional workspace.
- Add tooling (API + UI surface) that lets each authenticated family member assign linked accounts to themselves so views and filters can be scoped to the owner before saved-view controls are surfaced.
- Extend the API surface with CRUD endpoints guarded by the existing family auth token so clients can list, upsert, and delete saved views and mark one as the active workspace view.
- Refactor the dashboard UI (page, filters, table, state hooks) to expose saved view selection, pinning, and application, including a pre-seeded family workspace that aggregates every linked account with optional per-user overrides.
- Document the new capability in a dedicated OpenSpec spec so requirements stay captured before implementation.

## Impact
- Affected specs: `openspec/changes/add-saved-views/specs/dashboard-saved-views/spec.md`
- Affected code: `prisma/schema.prisma`, `app/api/*` (new saved-view endpoints), `app/dashboard/page.tsx`, `components/dashboard/*`, `components/dashboard/hooks/*`, `lib/family-auth.ts` (if needed for rate limits/context).
