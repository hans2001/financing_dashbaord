# Linked Accounts Panel Removal Plan

## Goal
Remove the redundant Linked Accounts panel from the dashboard overview and streamline the related state hooks since account filtering already surfaces linked institutions.

## Changes
1. Strip the `LinkedAccountsPanel` import and render from `DashboardShell`, allowing the summary column to occupy its previous slot.
2. Remove the `showAccountsPanel` state and any related setters from `useDashboardState` since the parent no longer toggles the panel.
3. Delete the `components/dashboard/LinkedAccountsPanel.tsx` component and its Vitest suite (`tests/components/dashboard/LinkedAccountsPanel.test.tsx`), removing unused helpers.
4. Rerun any necessary formatting or linting to keep the tree tidy.

## Verification
- Ensuring `DashboardShell` and `useDashboardState` build without references to the removed panel.
- Observing `npm run test` coverage already excludes the deleted tests, so no new tests are required for removal.
