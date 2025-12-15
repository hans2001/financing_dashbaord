# Change: Bring status badges into the shared palette

## Why
The status badge colors currently use a distinct amber/emerald styling that feels disconnected from the category badges, which now follow a shared palette. Aligning the status pills with that palette makes the entire row feel cohesive and establishes a single styling rule for all contextual badges in the table.

## What Changes
- Add a status badge palette in `components/dashboard/dashboard-utils.ts` that mirrors the rounded, token-based structure of category badges.
- Replace the inline status cell styling in `components/dashboard/TransactionsTable.tsx` with the new helper so pending/posted tags reuse the same badge classes and color families.

## Impact
- Affected specs: `category-color-coherence/spec.md`
- Affected code: `components/dashboard/dashboard-utils.ts`, `components/dashboard/TransactionsTable.tsx`
