## Context
Recent work split dashboard logic into modular hooks and React Query caches, making it straightforward to add another filter dimension. We already store normalized category strings in the transactions table and surface them in summaries, but there is no UI affordance or API parameter to narrow to a single category.

## Goals / Non-Goals
- Goals: add a reusable category filter UI, propagate its state through hooks/query keys, and ensure the API respects the filter without breaking existing defaults.
- Non-Goals: bulk CRUD for categories, saved filter presets, or multi-select tagging (single category is sufficient for this iteration).

## Decisions
- Maintain filter state inside `useDashboardFilters` so pagination reset+React Query dependencies stay centralized.
- Use an inline dropdown (matching Flow filter) populated from available categories (summary payload or static list) to avoid new network requests.
- Reuse existing `/api/transactions` handler and Prisma query builder, adding an optional `category` clause rather than a new endpoint.
- Extend existing Vitest/RTL suites instead of introducing new frameworks; cover hook state transitions plus API query param behavior.

## Risks / Trade-offs
- If available categories differ from dataset to dataset, we must ensure the dropdown gracefully handles values missing from the latest fetch (fallback entry + defensive parsing).
- Single-select keeps scope tight but may require future iteration for multi-select; architecture should keep type signatures generic enough to upgrade later.

## Open Questions
- Should category labels come from live API data or a curated enum? (Default plan: use API-provided categories and dedupe client-side.)
