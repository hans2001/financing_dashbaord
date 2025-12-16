# Change: Keep the flow filter inside the expanded panel

## Why
# Change: Keep the flow filter inside the expanded panel

## Why
The flow filter currently lives in the summary header and consumes valuable space while the rest of the tray remains collapsed. Keeping it alongside the rest of the filters reduces header clutter and matches the desire to hide less-frequent controls until the user explicitly opens the tray.

## What Changes
- Keep the `FLOW_FILTERS` buttons inside the expandable filter tray alongside the other controls and ensure they still call `setFlowFilter` when toggled.
- Add a standalone `FlowFilterControls` helper component for the segmented buttons, place it in the tray above the detail form, and reuse it anywhere else the flow selector is needed.
- Update `FilterChips` to include an entry for the current flow filter and allow removing it to reset to `All activity`.
- Adjust `DashboardPage`/`FiltersPanel` props to carry the shared flow state so the chips, tray, and data hooks stay in sync while the collapsed header remains minimal.
- Add or refresh component tests that cover the new controls, chip additions, and flow behavior to keep the layout and interactions stable.

## Impact
- Affected specs: `openspec/specs/dashboard/spec.md`
- Affected code: `app/dashboard/page.tsx`, `components/dashboard/FiltersPanel.tsx`, `components/dashboard/filters/FilterChips.tsx`, `components/dashboard/filters/FlowFilterControls.tsx` (new), plus the associated tests under `tests/components/dashboard`
