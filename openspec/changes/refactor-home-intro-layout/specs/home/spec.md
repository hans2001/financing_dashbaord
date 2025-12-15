## ADDED Requirements
### Requirement: Compact homepage introduction grid
The home page SHALL present the introduction messaging as a compact grid that highlights the family view, quick connect, and filter insights sections with uppercase headings and concise copy.

#### Scenario: Desktop experience displays row of cards
- **GIVEN** the viewport is wide enough for a multi-column layout
- **WHEN** the landing page loads
- **THEN** the three introduction cards appear side-by-side with consistent borders, rounded corners, and neutral backgrounds
- **AND** each card shows the provided uppercase heading text followed by the matching description

#### Scenario: Mobile experience stacks cards vertically
- **GIVEN** a narrow viewport
- **WHEN** the landing page loads
- **THEN** the same cards stack vertically to remain readable while keeping the compact spacing between them
