# Change: Refine filter panel density

## Why
The filter section currently consumes a large portion of the viewport with generous padding and tall controls, which crowds the transactions grid and summary. Shrinking the parent grid (summary, account selector, chips area, tray) will give more breathing room to the data while keeping the controls legible for finance-focused users.

## What Changes
- tighten the `FiltersPanel` card spacing, typography, and sync control so its summary/chips area sits in a denser grid
- refine the nested filter tray + category/account selectors to use smaller paddings and row heights while preserving clarity
- capture the new density expectations for the filter panel in a dedicated spec so future work can stay aligned with the compact layout

## Impact
- Affected specs: `filter-panel-density`
- Affected code: `components/dashboard/FiltersPanel.tsx`, `components/dashboard/filters/FilterSummary.tsx`, `components/dashboard/filters/FilterTray.tsx`, `components/dashboard/filters/FilterChips.tsx`, `components/dashboard/filters/AccountFilterSelect.tsx`
