# Design: Stable filter collapse layout

## Context
- The dashboard currently renders `FiltersPanel` above `TransactionsTable` inside the same card, so when the filter detail form is hidden the table jumps upward and the scroll position shifts.
- The user wants the ability to collapse filters for a focused transaction view without that vertical layout shift, which means the table must keep its anchor point even as the filter controls appear/disappear.
- We already plan to split `FiltersPanel` into smaller pieces and add a compact summary/chip strip; this offers a chance to also rework how the filters reserve space in the layout.

## Goals / Non-Goals
- Goals:
  - Keep the transaction table’s top edge visible and stationary whenever the filters are toggled.
  - Allow the filters to collapse/expand in-place but either overlay the table or take up consistent reserved space so no reflow occurs.
  - Preserve keyboard/ARIA focus order for the toggle and exposed controls and avoid jumping scroll positions.
- Non-Goals:
  - Moving the filters to a completely different page region (e.g., sidebar) or replacing the existing table layout.
  - Introducing a global layout library—keep the solution scoped to the dashboard card.

## Decisions
- Decision: Render the filters inside a `FiltersShell` that wraps both the compact header (title + toggle) and the detail tray; the shell will maintain a consistent height by making the tray absolutely positioned when collapsed or by pinning the table with a top inset that matches the tray height.
- Decision: Keep the table container’s padding/margins fixed; the filters will sit in a relative container with `position: relative` so the detail tray can overlay without influencing the table’s `offsetTop`. When the tray is expanded, apply an `inset`/`padding-top` that mirrors the tray height so the table slides under a translucent background if needed.
- Decision: Use `useDashboardState`’s `areFiltersCollapsed` to drive CSS classes; the toggler will update `aria-expanded` and the detail tray will animate via CSS transitions (height/opacity) without toggling a `hidden` class that removes the element from the flow.
- Decision: Introduce a new helper (e.g., `useFilterLayoutSpace`) that measures the tray height and exposes a `style` object for the table container so it can offset itself by that much when the tray is shown, ensuring the table content never jumps even if the tray handles variable height due to different filter combinations.

## Risks / Trade-offs
- Overlaying the filters could partially cover the table when expanded; mitigate by dimming the overlay and keeping the toggle near the top so users can easily collapse without scrolling.
- Measuring DOM height introduces layout effects; mitigate by limiting measurement to when the tray opens and caching the value until filters change.
- Keeping the tray in the DOM but absolutely positioned requires careful z-index management to avoid covering right-side summary content; place the tray within the left column card so it cannot overflow beyond the table area.

## Migration Plan
- Update `FiltersPanel` to the new `FiltersShell`/`FiltersTray` structure; keep API backwards-compatible until `DashboardPage` is updated to use the new structure during implementation.
- Add unit tests for the layout helper and integration tests verifying the table’s `offsetTop` before/after toggles.

## Open Questions
- Should we reserve a fixed minimum height for the detail tray so there are no gaps when the panel first renders in desktop vs mobile breakpoints?
- Do we need to support animation frames for mobile browsers where `offsetTop` measurements are expensive?
