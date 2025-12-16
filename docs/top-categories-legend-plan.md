# Top Categories Legend Font Plan

## Context
- The legend items under the “Top categories” pie chart currently use `text-sm`/`text-xs` classes, which renders a large, airy label and percent line that makes the whole legend feel spaced out in the card.

## Goal
- Reduce the font size and tighten the legend spacing while keeping the label/percentage text legible and aligned with the dashboard’s compact card style.

## Proposed Adjustments
1. Lower the font size of the legend container to a custom `text-[0.7rem]` baseline so all entries shrink uniformly, then add a slightly bolder class for the label span to ensure readability.
2. Reduce the percent text size to `text-[0.6rem]` so the two-column layout remains tight.
3. Keep the existing flex layout but remove any redundant width constraints that might push entries apart; rely on the on-`md` wrapping behavior for responsiveness.

Documenting this gives future changes a reference before touching `SummaryPanel.tsx`.
