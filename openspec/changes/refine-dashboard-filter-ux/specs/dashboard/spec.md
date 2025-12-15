## ADDED Requirements
### Requirement: Dashboard filters use staged disclosure and a compact summary
The dashboard SHALL surface only the most critical filter inputs (account picker, date range summary, flow toggles) in a persistent row while hiding the remaining controls inside an expandable tray so the primary canvas stays calm yet discoverable.

#### Scenario: Compact summary opens a collapsible detail tray
- **WHEN** the dashboard renders, it MUST default to the compact state that shows just the priority inputs and a collapse/expand control while hiding the rest of the form; when the user clicks expand, the tray opens, animates, and focuses the first input and the collapse state propagates through `areFiltersCollapsed`.
- **THEN** the tray MUST contain every filter control currently in `FiltersPanel` grouped into logical sections (dates, pagination, classification), the expanded controls MUST still validate with the existing resolver logic, and closing the tray returns focus to the expand button without losing state.

### Requirement: Active filter chips describe and mutate the applied criteria
The system SHALL derive a pill for each active filter (account, dates, flow, category, sort, page size) that mirrors the behavior of the chip bars in apps like Linear/Notion so users always know why results look the way they do.

#### Scenario: Chips reflect filters and support removal
- **WHEN** any filter value changes, the chip strip MUST update to show a label such as “Account: Checking”, “Dates: Jan 1 – Jan 31”, or “Flow: Spent”; each chip and the strip’s “Clear all” affordance MUST call the setters from `useDashboardState` to reset that filter and clear selections/pagination.
- **THEN** the chip strip MUST survive while the tray is collapsed, removing all chips (or clicking “Clear all”) MUST reset the corresponding filters, and the UI MUST show placeholder text when no additional filters are applied.

### Requirement: Collapsing filters does not shift the transactions table
Focusing on the transactions table is important for data-heavy work, so collapsing or expanding the filters SHALL not change the table’s vertical position or cause an unexpected viewport jump; the panel may overlay the content or reserve fixed space, but the first row of transactions must stay where it was before the toggle.

#### Scenario: Toggle filters while the user reads the table
- **WHEN** the user clicks “Hide filters” or “Show filters,” the filter controls MAY animate, but the `TransactionsTable` container’s `offsetTop` must remain unchanged (or the same as just before the toggle), and the caret-involved focus control SHOULD stay glued to the header.
- **THEN** the table content MUST remain visible without layout shift, the toggle button MUST still be accessible (for keyboard/assistive tech), and opening the filters again MUST not push the table downward.

### Requirement: Filter controls and helpers stay modular and testable
Every new filter sub-component (summary row, chips, detail tray) SHALL reside in its own file with supporting helpers so the module size stays under ~300 lines and logic such as normalizing category options or date validation remains encapsulated.

#### Scenario: Modular filters reuse shared hooks and tests
- **WHEN** developers open the filter files, they MUST see distinct exports for the summary, chips, and detail form, each with dedicated hooks/helpers (for example `useFilterSummary`, `normalizeCategoryOptions`), and the components SHOULD be covered by unit tests verifying collapsed/expanded rendering, chip generation, and helper edge cases.
- **THEN** the refactor MUST preserve the existing interactions with `useDashboardState` (resetting pagination/selection on setter calls, keeping the resolver logic intact) so no regressions appear in the transaction feed.
