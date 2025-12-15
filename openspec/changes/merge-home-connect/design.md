## Context
- The current landing page renders a hero section with a CTA to connect an account, while the Plaid Link workflow lives on a separate `/connect` route.
- The user wants to merge these two experiences so that `/` immediately shows the Plaid Link flow, deferring any future authentication gating logic to later work.
- Centralizing the Plaid connect surface avoids duplicating the data-fetching and reporting logic, simplifying maintenance and making it easier to verify the landing experience behaves identically from both `/` and `/connect`.

## Goals / Non-Goals
- Goals:
  - Render the Plaid Link UI and related environment messaging directly on `/` while keeping `/connect` available for future variants.
  - Share the link-token fetching, exchange, and report-error logic between `/` and `/connect` via a reusable component and supporting hooks so the behavior stays in sync.
  - Keep the existing textual guidance (production notes, button states) intact.
- Non-Goals:
  - Implementing authentication gating or role-based redirects—authentication will be layered on later.
  - Rebuilding the Plaid Link experience from scratch; we're reusing the existing webflow.

## Decisions
- Decision: Introduce a `PlaidConnectPanel` component that encapsulates the UI currently living in `app/connect/page.tsx` and accepts callbacks for navigation (defaulting to `/dashboard`).
- Decision: Pair the panel with a `usePlaidLinkToken` hook responsible for calling `/api/plaid/create-link-token`, normalizing loading/error states, and exposing the latest link token so both the root page and `/connect` can reuse it.
- Decision: Keep the `/connect` route but have it render `<PlaidConnectPanel />` so the dedicated page remains available even after the landing merge.
- Decision: Keep `router.push("/dashboard")` as part of the successful exchange flow, so the user ends up on the dashboard regardless of which route started the process.

## Risks / Trade-offs
- Risk: Moving the effect logic into a shared hook could inadvertently change the timing of token fetching. Mitigation: keep the hook's API close to the current implementation and cover edge cases with manual testing.
- Risk: Styling changes may occur when removing the hero wrapper. Mitigation: keep the panel markup and padding identical to the connect page so the UI matches.

## Open Questions
- Should the root page keep any hero-style copy or branding, or should it fully mirror the `/connect` copy for now?
- Will future authentication gating live on `/` (requiring us to keep the hero) or on a dedicated route once auth is ready?
