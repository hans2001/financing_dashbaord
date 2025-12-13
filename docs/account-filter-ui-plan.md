# Account filter UX update

## Goal
- Replace the current native select with a more approachable, searchable, multi-select input so selecting multiple accounts feels discoverable.
- Keep the existing logic that treats the `all` sentinel as an override and normalizes the selection before it reaches the filters store/API.

## UI (#UI)
- Row 1 (top): the account selector sits beside the “From”/“To” date inputs so it shares the first grid row: account filter first, then the date range controls. This row stays taller to accommodate the multi-select, but the surrounding inputs should match its height via the `StylesConfig` tweaks so everything reads as a single band.
- Row 2 (below): the “Rows”, “Flow”, “Category”, and “Sort” dropdowns occupy the second grid row, sharing the remaining columns and keeping their height thin. Each control should fill its allotted width proportionally, mirroring the dimensions of the other filters so the panel still feels like a cohesive grid of inputs.

## Component choice
- Use `react-select` (widely adopted, accessible, and easy to style) in `isMulti` mode.
- Map each account to an option with `{ label, value }`, and include an explicit "All accounts" option that gets selected whenever the store contains only `"all"` or the user clears their selection.
- Render the control with a slimmer height and a subtle border to match the other filters.

## Interaction details
- The form field remains `accountIds: string[]`, so validation/resolvers stay intact.
- When the user picks/deselects items, normalize the array by deduplicating, filtering out falsy values, and falling back to `"all"` when the list becomes empty.
- Sync the field back to `useDashboardFilters` only when the normalized array actually changes (to avoid unnecessary refetches).

## Implementation summary
- Swapped the native account `<select>` for an `isMulti` `react-select` control so users can pick multiple accounts with tags, search, and cleaner spacing.
- Normalized any selection that includes `all` so that `All accounts` remains exclusive while picking explicit accounts overrides it, and resolvers still use `accountIds: string[]`.
- The new control is styled via `StylesConfig` to match the rest of the filters, and `FiltersPanel` only calls `setSelectedAccounts` when the normalized array actually changes.

## Testing notes
- `npm test -- tests/hooks/useDashboardFilters.test.ts` (passes)

## Validation items
1. Confirm the design note satisfies the team (this file).
2. Verify the UI now renders the tag-based selector and the `all` sentinel behaves as expected before shipping the change.
