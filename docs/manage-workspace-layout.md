# Manage Workspace layout

This note captures the simplified design for Manage mode so we can agree on the single shared workspace before refining the JSX for the saved-view feature.

## Goals
- Keep the header row (View / Manage pills + sync button) exactly as in View mode so toggling between the two modes feels seamless.
- Treat Manage as one cohesive slab underneath the header—no nested grids, tabs, or secondary containers—so all actions (choose a view, rename it, and attach/detach accounts) happen inside a single space.
- Use the existing UI primitives (select, buttons, cards, badges) to keep the Manage UI consistent with the rest of the dashboard.

## Layout outline
1. **Two-panel grid (side-by-side)**
   - The Manage workspace sits in a grid with two columns: the saved-view controls on the left and the linked-account list on the right. Both columns share the same container height so the panel feels balanced and matches the View-mode density.
   - The grid inherits the same rounded border/white surface from the View mode, and each column scrolls internally (the account list is scrollable while the view controls remain sticky in their column).
2. **Saved-view controls (left column)**
   - A full-width select/dropdown lists every saved view and marks the active one. Changing the dropdown immediately applies the view.
   - The inline name field sits near the dropdown so renaming feels connected to the selected view, with a helper text that clarifies “Update active view” only changes the highlighted view’s name and bindings.
   - Two action buttons live together: “Update active view” (enabled when a saved view is selected) and “Save as new view” (always available). Labels make it crystal clear which flow each button runs.
   - Summary text below the controls explains which filters are captured, the pinned date range, and how many accounts are attached so users always know what the active view represents.
3. **Linked-account list (right column)**
   - Every linked account is shown with a checkbox, “Attached”/“Available” badge, balances, institution, and freshness timestamp.
   - Bulk actions (“Attach all” and “Refresh”) sit above the scrollable list so users can quickly adjust or resync.
   - A helper badge highlights how many accounts are attached, keeping the selection intent transparent even while scrolling.

## Interaction notes
- Selecting a saved view immediately refreshes the account checkboxes and filter summary, matching the metadata returned from the API.
- The name field is just another part of the top row—it updates the active view’s label when the user clicks Update and lets the user save brand-new views with the same dropdown-based context.
- The account checkboxes control which accounts are bound to the active view; unchecking every box reverts to the default “all” binding, but the user can always “Attach all” back.
- There are no secondary tabs or grids; everything is visible in one place, and the list scrolls inside the same panel so the header and controls never change position.

## Accessibility / UX
- The reading order remains top-to-bottom: selector + buttons → name input → summary → account controls.
- Each account showing a textual badge (“Attached” vs. “Available”) keeps the state clear for assistive technology.
- On narrow screens the panel still stacks the rows vertically so the select/name area always sits above the account list.
