# Change: Refine Linked Accounts Panel Layout

## Why
- The linked accounts surface still feels stacked and a bit noisy: the header text is two lines, the action button floats at the top of the card, and each account row occupies three lines with large, repetitive spacing. The new UX should read as a single row for the header and show each account in a tighter, legible row so the panel feels clean and consistent with the rest of the dashboard.

## What Changes
- Align the "Linked accounts" label, the muted connected count, and the toggle/action on the same baseline, giving the connected count a low-emphasis style while keeping the control easy to reach.
- Refactor the account rows so the metadata (institution, currency timestamp, account type) sits beside or below the name in a compact layout that remains legible even when multiple accounts are shown.
- Update the LinkedAccountsPanel tests (and any related docs or snapshots) to verify the new structure and text nuances.

## Impact
- Affected specs: `dashboard-linked-accounts`
- Affected code: `components/dashboard/LinkedAccountsPanel.tsx`, `tests/components/dashboard/LinkedAccountsPanel.test.tsx`, and any docs describing the panel layout.
