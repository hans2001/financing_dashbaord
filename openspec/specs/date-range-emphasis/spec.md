## ADDED Requirements
### Requirement: Date range summary emphasis
`FilterSummary` SHALL present the selected date range in a visually weighted treatment so it reads as the primary context for the dashboard and clearly contrasts the surrounding filter controls.

#### Scenario: Date label is the dominant header
- **GIVEN** the card at the top of `FiltersPanel` shows the date range and filter actions,
- **WHEN** the dashboard renders,
- **THEN** the date range text SHALL use a bolder weight, slightly larger size, and accessible color contrast so it immediately draws the eye without upping the card height.

#### Scenario: Decorative treatment adapts in light/dark
- **GIVEN** the dashboard may adopt subtle background shades,
- **WHEN** the date label renders in either light or darker contexts,
- **THEN** it SHALL gain a soft background/outline or underline cue (rather than a saturated color) so it stands out while remaining consistent with the existing tone.

#### Scenario: Semantic separation from action buttons
- **GIVEN** the `Clear all` and `Show/Hide filters` buttons sit alongside the date text,
- **WHEN** the new styling applies,
- **THEN** the date label SHALL remain distinct (e.g., via spacing or inline badge) so the action controls are still clearly identified and not mistaken for the primary context.

#### Scenario: Responsive legibility
- **GIVEN** the dashboard can squeeze into narrower containers,
- **WHEN** the viewport shrinks,
- **THEN** the emphasized date text SHALL wrap gracefully or truncate with ellipsis while keeping the weight difference from the link-style buttons, avoiding overflow or layout shifts.

#### Scenario: Spec captured for future reference
- **GIVEN** the project rule to document refactors,
- **WHEN** this change ships,
- **THEN** this spec SHALL live under `openspec/specs/date-range-emphasis/spec.md` so subsequent agents can understand the intent for the filtered header treatment.
