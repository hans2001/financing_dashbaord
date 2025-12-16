# Compact Dashboard Filters Plan

## Motivation
The dashboard filters panel is consuming more vertical space than is desirable, especially now that the linked accounts selector sits below the header. We need a more compact, professional arrangement that keeps all high-level filter controls within a tight, easily scannable header while keeping the expanded tray accessible when needed.

## Goals
- Keep the top bar (date range label, account select, filters toggle, sync/clear actions) in a single low-height row or tight stack so it no longer pushes the rest of the dashboard down.
- Treat the accounts selector as part of the header and visually align it with the date range label and action buttons.
- Reduce the padding/gap inside the filters panel (summary, chips, and collapsed tray) to deliver a more professional, condensed feel.
- Preserve accessibility and functionality (clear filters, show/hide filters, sync, etc.) while tightening spacing and font sizes.

## Implementation Sketch
1. Update the summary header component to emit a denser layout:
   - Render the date range label, an inline `AccountFilterSelect` (possibly a compact variant), and a row of action buttons (`Show/Hide filters`, `Clear all`, `Sync`) using smaller text, tighter padding, and a unified background.
   - Keep the collapse control visible for keyboard usage and maintain the detail tray `aria` attributes.
2. Adjust `FiltersPanel` structure so the summary/header, chips row, and action row live closer together; remove extra border spacing and shrink gaps.
3. Refine `FilterChips`, `FilterTray`, and `AccountFilterSelect` styles (text size, padding, borders) to match the compact theme while keeping overflow and dropdown behavior unchanged.
4. Ensure the collapsed content uses a tighter container (smaller padding) and that the panel still looks good at various breakpoints (desktop/tablet).

## Success Criteria
- The top filter bar no longer exceeds ~64px height at default font sizes.
- The accounts filter now appears inline with the summary controls.
- The entire filters card feels like a single compact component with minimal vertical breathing room while still providing clear affordances.
- No functionality regressions and component APIs (props) remain stable.
