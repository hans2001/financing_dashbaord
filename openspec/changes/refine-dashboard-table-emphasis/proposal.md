# Change: Emphasize transactions table in dashboard layout

## Why
The dashboard should feel finance-forward and professional, with the transactions table as the primary work surface. The current visual balance gives supplemental panels nearly equal weight, which competes with the table.

## What Changes
- Define layout requirements that make the transactions table the dominant visual region and ensure the summary sidebar reads as supplemental.
- Compact the summary cards and reduce their visual weight while keeping information density intact.
- Slightly increase table readability so it remains the focal point without sacrificing density.

## Impact
- Affected specs: `dashboard-layout`
- Affected code: `components/dashboard/DashboardShell.tsx`, `components/dashboard/SummaryPanel.tsx`, `components/dashboard/TransactionsTable.tsx`
