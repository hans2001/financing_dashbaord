# Change: Refine dashboard view layer

## Why
The dashboard currently spends too much real estate on filter state and saved-view controls, which dilutes the focus on the actual account data families care about. We already have linked accounts loaded; the UI should make those the centerpiece while laying the groundwork for a lightweight view toggle that feels cohesive with the filter row rather than a separate card.

## What Changes
- Define a new dashboard capability for describing how view toggles and the linked accounts panel should share layout space, making filters secondary to the attached-account canvas.
- Outline the intended structure for a compact view selector row (mirroring the filters panel styling) that drives which child view (e.g., account list vs. transactions) renders in the main card.
- Capture implementation tasks (component boundaries, helper hooks, validation) so we can execute once this plan is approved.

## Impact
- Affected specs: `dashboard-views`
- Affected code: `app/dashboard/page.tsx`, `components/dashboard/*`
