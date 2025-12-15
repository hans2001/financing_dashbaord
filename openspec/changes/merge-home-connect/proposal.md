# Change: Merge Home and Connect Experience

## Why
- The root landing page is currently a largely static hero section while the Plaid connect flow lives under `/connect`, so visitors have to take an extra click before they can connect an account. Merging the experience keeps the landing funnel simple until authentication/authorization is introduced.
- Centralizing the Plaid Link UI into a shareable surface reduces duplication and makes it easier to maintain the wiring (token fetching, error handling, reporting) from one component while still allowing the `/connect` route to remain accessible for future flows.
- The user asked to document the design and detailed spec before implementing, so capturing that work up front keeps the team aligned.

## What Changes
- Add a shared Plaid connect experience component (and any supporting hooks) that encapsulates link-token fetching, exchange handling, and environment messaging.
- Replace the current hero-driven landing page with that shared component so `/` renders the Plaid connect flow immediately while leaving `/connect` in place for future segregation.
- Record the landing experience design decisions and a detailed OpenSpec delta before touching the implementation, keeping the proposal traceable.

## Impact
- Affected specs: landing-experience (new capability describing the merged landing/connect surface)
- Affected code: `app/page.tsx`, `app/connect/page.tsx`, plus any new components or hooks introduced to host the shared connect panel
- Risk: Subtle link-token/state bugs if we duplicate effect logic, so deduplicating early in a shared helper minimizes regressions.
