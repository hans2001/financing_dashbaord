## Context
We need to keep the transactions dashboard responsive while datasets grow. The current summary endpoint reads every transaction (in batches) and performs JS-level reductions, consuming both memory and CPU on the server. Meanwhile, the client unnecessarily recreates `Intl.NumberFormat` for each rendered amount, amplifying runtime allocations.

## Goals / Non-Goals
- **Goals:**
  - Let PostgreSQL compute total spend/income, counts, and category aggregates so the API no longer materializes every row.
  - Provide a shared `Intl.NumberFormat` so the dashboard reuses the same formatter across renders.
- **Non-Goals:**
  - Virtualizing or lazily loading the transactions table rows.

## Decisions
- **Decision:** Replace the chunked loop with `prisma.transaction.aggregate` (totals/counts) and `groupBy` (per-category sums). This keeps arithmetic near the database and avoids the `skip`/`take` loop that scales poorly with large offsets.
- **Decision:** Cache a single `Intl.NumberFormat` inside `dashboard-utils.ts`; every `formatCurrency` call uses that cache.

## Risks / Trade-offs
- `groupBy` requires Prisma to know about every grouped field, so the mocks need to support it; we will expand `tests/test-utils/mocks.ts` accordingly.
- We rely on `normalizedCategory` being populated, so existing rows without it fallback to a safe label (e.g., `"Uncategorized"`).

## Migration Plan
No database migrations are necessary; the change only affects how the API queries and formats data.

## Open Questions
- Should we expose any hints back to the UI when the dataset is very large? (Out of scope for this change.)
