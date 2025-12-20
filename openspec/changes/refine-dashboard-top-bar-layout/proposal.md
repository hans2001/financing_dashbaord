# Change: refine dashboard top bar layout

## Why
- The dashboard currently renders a duplicated hero block ("Family Dashboard" / "Finances") and a floating logout button below the global navigation. This makes the top of the page feel disconnected from the nav bar.
- Users expect the main dashboard content to begin immediately after the nav and want the sign-out action to live alongside the nav links for quick access.

## What Changes
- Relocate the `LogoutButton` into `TopNavigation` so the sign-out action sits beside the Dashboard link.
- Remove the duplicate header inside `DashboardShell` and tighten its top padding so the first section hugs the nav bar.
- Update the global layout/content spacing so nothing sits between the nav and the rendered overview.

## Impact
- Affected specs: dashboard-layout (new)
- Affected code: `components/layout/TopNavigation.tsx`, `components/dashboard/DashboardShell.tsx`, `components/dashboard/LogoutButton.tsx`, and any shared styling that keeps the nav/content gap minimal.
