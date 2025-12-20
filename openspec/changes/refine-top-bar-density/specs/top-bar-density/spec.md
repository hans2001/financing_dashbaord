## ADDED Requirements
### Requirement: Compact dashboard top bar
`DashboardShell` SHALL render the header with a tighter visual rhythm, shorter wordings, and more professional tone so the top bar feels like a finance cockpit while leaving extra vertical room for the rest of the layout.

#### Scenario: Workings adopt finance vocabulary and concise text
- **GIVEN** the previous header rendered "Family Dashboard" + "Finances" with generous spacing,
- **WHEN** the compact header renders,
- **THEN** it SHALL present the same context using shorter words (for example, "Family" + "Finance" or similar) and balance the typography so the title reads like a finance panel label instead of decorative copy.

#### Scenario: Padding and size reductions reclaim vertical space
- **GIVEN** staff want the summary and table to dominate the viewport,
- **WHEN** the header renders with the new compact tokens,
- **THEN** the `header` element SHALL shrink its top/bottom padding, reduce letter spacing/tracking, and keep the action area (e.g., `LogoutButton`) aligned without stacking, so the overall page requires fewer pixels above the grid.

#### Scenario: Accessibility and responsivity stay intact
- **GIVEN** users may resize the viewport and rely on the logout control,
- **WHEN** the compact header layout is applied,
- **THEN** the logout button SHALL remain visible/clickable and the header text SHALL continue to maintain sufficient contrast/line height even as font sizes drop, preventing layout shifts that hide controls.
