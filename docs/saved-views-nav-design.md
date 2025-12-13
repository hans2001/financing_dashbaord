# Saved view navigation redesign

## Goals

- Surface only the two navigation buttons in the hero, drop the “Accounts & spending” heading + tagline, and keep the hero minimal so the rest of the dashboard stays visually lightweight.
- Let people quickly switch between saved views and optionally tweak which accounts each view binds to without leaving the hero area.
- Reuse the existing selection state (accounts from the Filters panel) when editing a view so we do not duplicate state or push the dashboard filters into a separate store.

## Proposed tabs

1. **Views**: embed `SavedViewControls` inside the hero under the navigation buttons so only the tabs appear at the top. Keep the dropdown+save button interaction and the new “Browsing saved views” indicator so the top bar feels minimal.
2. **Manage**: show a compact form with:
   - A text input prefilled with the active view’s name (or a placeholder when no view is active), so users can rename the current view or choose a name for a new one.
   - A “Select accounts” checklist that mirrors the current `selectedAccounts` filter state (toggling an account updates that state immediately, since the request already said to reuse the existing selection set).
   - Buttons for “Update view” (visible when a saved view is active) and “Save new view”. Both buttons call the same `handleSaveCurrentView` hook but pass `viewId` when updating.
   - Clear inline feedback for loading/error status, plus a “Select all accounts” shortcut that just flips the selection to `["all"]`.

The hero’s tab switcher will live above the panels, and only the selected tab’s content should be visible while the rest of the dashboard remains untouched. The hero container itself will stay slim to satisfy the “collapsed” ask.

## Questions

1. Should the manage tab also support unpinning/pinning or deleting a view, or should those controls live somewhere else?
2. Does the “Select accounts” checklist need to reflect account groupings (e.g., savings vs. credit) or is a flat list acceptable for now?
3. When creating a new view in Manage, should we reset the selection state afterward, or should the dashboard remain tuned to the chosen accounts?
