## ADDED Requirements
### Requirement: Compact filter panel grid
`FiltersPanel` SHALL reduce the padding/gaps around the summary, account selector, chips, and tray so that the parent card becomes a tight, finance-focused grid while keeping every control legible and interactive.

#### Scenario: Summary area carries lighter padding
- **GIVEN** the current summary card uses generous padding and a tall sync action,
- **WHEN** the compact layout renders,
- **THEN** the `section` SHALL shave the outer padding to 8px or less, reuse smaller font sizes for the date label, and keep the summary/chips stack without extra vertical gaps so the overall height shrinks without hiding any actions.

#### Scenario: Chips/account row stays readable when condensed
- **GIVEN** the chips row and account selector currently span full-width padding,
- **WHEN** the density update applies,
- **THEN** the chips container and account select wrapper SHALL shrink their horizontal padding and line heights so they share a close-knit grid while still leaving enough space for category tags, balances, and the `Show all` trigger.

#### Scenario: Filter tray still flows when open
- **GIVEN** the collapsible detail tray reveals more controls,
- **WHEN** the layout is compacted,
- **THEN** the tray SHALL keep shorter gaps/padding but retain accessible hit areas (min 32px height) for date selectors, dropdowns, and the flow control so the expanded rows do not feel cramped even as spacing is reduced.
