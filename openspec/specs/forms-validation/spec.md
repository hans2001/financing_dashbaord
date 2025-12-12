## ADDED Requirements
### Requirement: Dashboard filters rely on a single schema-driven form
`FiltersPanel` SHALL run every filter control through one `react-hook-form` instance powered by a Zod schema so defaults, validation, and UI feedback stay in sync without duplicating logic.

#### Scenario: Defaults stay aligned with `useDashboardFilters`
- **GIVEN** `useDashboardFilters` exposes `selectedAccount`, `dateRange`, `pageSize`, `flowFilter`, `categoryFilter`, and `sortOption`,
- **WHEN** `FiltersPanel` mounts,
- **THEN** the RHF default values MUST mirror those setters, so the schema can validate them with the shared values (e.g., the first flow option, the computed default date range, etc.) and the UI never drifts from the persisted state.

#### Scenario: Field changes are validated before the hook setters run
- **GIVEN** the Zod-backed resolver knows about the allowed flow values, sort orders, ISO date format, and page-size literals,
- **WHEN** the user changes any control,
- **THEN** the schema MUST still run (rejecting malformed dates or unsupported sort values), the form state MUST respect the normalized value, and only after validation succeeds SHALL the corresponding `onXChange` callback (`onDateRangeChange`, `onPageSizeChange`, etc.) run so the store never sees invalid input.

#### Scenario: Schema honors category filter work in progress
- **GIVEN** `categoryOptions` may grow thanks to the ongoing category-filter thread,
- **WHEN** the user selects a category (even one not part of the current summary data yet),
- **THEN** the form schema MUST accept any string and continue to call `onCategoryFilterChange`, avoiding hard-coded option lists that would conflict with the category-filter effort.

### Requirement: Description editor enforces server-friendly limits
`DescriptionEditor` SHALL use the same RHF + Zod stack so the client-side validation mirrors the `/api/transactions/[id]/description` contract and surfaces errors before hitting the network.

#### Scenario: Trimmed description length stays under 500 characters
- **GIVEN** the server will trim and reject descriptions longer than 500 characters,
- **WHEN** the user types a description,
- **THEN** the Zod schema MUST trim whitespace, enforce the 500-character ceiling, and expose a helpful error message so the UI never attempts an invalid PATCH request.

#### Scenario: Validation errors appear alongside server responses
- **GIVEN** the network request may still fail even after validation (e.g., stale auth),
- **WHEN** `handleSubmit` rejects because of Zod issues or the PATCH returns an error,
- **THEN** `DescriptionEditor` MUST show the validation error priority (from `formState.errors`) and fall back to the API error message, keeping the existing success/error badges intact.
