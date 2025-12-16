# Change: Refine transaction categorization heuristics

## Why
Many ledger rows still fall back to the `Uncategorized` bucket because the backend payloads arrive without normalized metadata, even though the merchant or description already exposes a recognizable payee (Zelle transfers, campus merchants, local restaurants, rewards statements). That noise undermines the summary panels, filters, and category palette that should stay accurate.

## What Changes
- Extend `lib/transaction-category.ts` so the override rules scan both the `merchantName` and `name` text and include additional keywords for the missing merchants described above (restaurants, campus payments, rewards statements, banking transfers) so they resolve to existing normalized categories.
- Expand the palette guardrails in `components/dashboard/dashboard-utils.ts` if any new normalized labels are introduced, and document that color entries must exist for the heuristics that run on the dashboard.
- Add regression tests for the override helpers so we can verify the new keywords + source selection continue to surface the intended category paths.

## Impact
- Affected specs: `category-color-coherence/spec.md`, `transaction-categorization/spec.md`
- Affected code: `lib/transaction-category.ts`, `components/dashboard/dashboard-utils.ts`, `tests/**/*`
