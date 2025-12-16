# Change: Surface account balances in the dashboard account filter

## Why
Some users link multiple accounts with the same display name (e.g., "Adv SafeBalance Banking") so the current multi-select pill and menu make it hard to differentiate which data is driving the transactions table. We already fetch balances for every account, so showing that context inside the filter control should improve clarity without requiring extra clicks.

## What Changes
- Extend the account multi-select control to render the available/current balance beside each account option (both in the dropdown rows and the selected pills) for easier at-a-glance identification.
- Keep the dropdown layout compact, using muted typography for the balance line and ensuring the pill overflow indicator still triggers when many accounts are selected.
- Update the helper tests/specs to cover the new label text and the API query exposure so we can guard the extra formatter behavior.

## Impact
- Affected specs: `dashboard-filtering`
- Affected code: `components/dashboard/filters/AccountFilterSelect.tsx`, relevant tests, helper utils for formatting balances
