# Change: Align dashboard category palette

## Why
The category badge colors and the summary pie colors were born separately, so slices no longer match the table tags and the palette feels informal. Aligning both visuals to a shared, more professional palette increases readability and makes future category additions straightforward.

## What Changes
- Define a single palette in `components/dashboard/dashboard-utils.ts` that pairs normalized categories with badge classes and a pie color, and expose helper utilities that use the palette by normalized key.
- Update the transactions table badge rendering to consume the palette entries so that badges automatically gain the new color tokens.
- Refactor the summary panel pie so each segment and legend entry pulls the palette color for its normalized category instead of cycling through the old fixed list; ensure the "Other" slice falls back to the default palette.

## Impact
- Affected specs: `category-color-coherence/spec.md`
- Affected code: `components/dashboard/dashboard-utils.ts`, `components/dashboard/TransactionsTable.tsx`, `components/dashboard/SummaryPanel.tsx`
