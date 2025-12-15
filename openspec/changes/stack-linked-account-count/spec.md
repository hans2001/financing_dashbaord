# Change: Stack Linked Accounts Count

## Why
- The linked account header reads as a single row (`Linked accounts` followed by `X connected · ...`), but the desired layout separates the count and meta information below the title to improve vertical rhythm and readability.

## What Changes
- Rework the `LinkedAccountsPanel` header so the "Linked accounts" label is the primary line and the connected/selection metadata sits on its own line directly beneath it.
- Keep the toggle/action control on the right aligned with the header container but allow the label stack to dictate its own height so the count stays visually below the title on every breakpoint.
- Confirm any snapshots, styles, or docs (if present) reference the new stacking behavior.

## Impact
- Spec: `dashboard-linked-accounts`
- Code: `components/dashboard/LinkedAccountsPanel.tsx`
