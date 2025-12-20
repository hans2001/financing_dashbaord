# Change: Refine dashboard header density

## Why
The dashboard header currently occupies more vertical space than the rest of the layout, and its typography/tone feels informal relative to the rest of the finance-focused UI. Making it more compact and professional will let the transaction grid and summary panels gain breathing room while reinforcing the finance-oriented brand.

## What Changes
- tighten padding and typography in the dashboard header so the top bar fits the new compact, financial tone
- adjust the header content (labels, titles, calls-to-action) to use concise wordings and consistent naming
- document the new density requirement in a dedicated spec so future work can be evaluated against the compact top bar goal

## Impact
- Affected specs: `top-bar-density`
- Affected code: `components/dashboard/DashboardShell.tsx`, potential new `components/dashboard/TopBar.tsx`
