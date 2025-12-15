## ADDED Requirements
### Requirement: Shared dashboard category palette
The finance dashboard SHALL provide a single palette that maps normalized category keys to the badge token triplet (background, text, border) and a pie color so that every visualization that surfaces the same category uses the same hue system-wide.

#### Scenario: Consistent badge and pie rendering
- **WHEN** the transactions table renders a row whose `categoryPath` resolves to a normalized category (e.g., `Food > Dining`) and the summary panel renders the same normalized category in its pie chart and legend
- **THEN** the category badge, the matching pie segment, and the legend entry all reuse the palette entry for that normalized category
- **AND** the badge uses the palette badge tokens so that text, border, and background align with the same color family as the pie
- **AND** adding a new normalized category only requires adding a new palette entry so that both visuals adopt the new color immediately

### Requirement: Accessible color contrast for category tokens
Badge text and borders SHALL maintain contrast ratios suitable for WCAG AA when laid over the background color, and summary pie legend labels SHALL render with high enough contrast over the dashboard background.

#### Scenario: Contrast regression guardrails
- **WHEN** a designer updates a palette entry or adds a new normalized category
- **THEN** the implementation still renders badge text that has at least a 4.5:1 contrast ratio with its background (e.g., text-700 on bg-50/100) and the legend text remains `text-slate-900`
- **AND** the pie color for that palette entry reuses the same hue family so that even at smaller sizes the chart remains legible and visually tied to the table badge
