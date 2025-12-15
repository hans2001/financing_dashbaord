## ADDED Requirements
### Requirement: Horizontal rhythm for transaction table columns
`TransactionsTable` SHALL adopt explicit column-width guidance so each field uses space that matches its purpose while keeping the selection control separated from the date column and preserving the inline description editor's usability.

#### Scenario: Desktop column widths match the rhythm
- **GIVEN** the dashboard renders on a desktop viewport inside the existing card
- **WHEN** the transactions data arrives
<<<<<<< ours
- **THEN** the table SHALL use `table-fixed` with a `<colgroup>` that pins the checkbox column at ~2.5rem, the date column at ~8rem (with right padding so it never touches the checkbox), and it SHALL prioritize merchant/name and amount near the left edge (the widest chunks) while the account, category, status, and description columns remain to their right in that order, keeping the description column at least 12rem high so it can wrap without triggering horizontal scroll
- **THEN** the merchant names SHALL still rely on `truncateInline` and the description SHALL remain editable inside an overflow-safe but wrapping container so the table respects the new grid but never exceeds the card width
=======
- **THEN** the table SHALL use `table-fixed` with a `<colgroup>` that sets the checkbox column at ~2.5rem, the date column at ~8rem (with padding on the right so it does not abut the checkbox), the status column around 5rem, the account column around 7rem, the merchant/name column as the widest fixed chunk (~24rem but clamped so it never forces horizontal scroll), the category column around 6rem, the description column with a 12rem minimum but allowed to grow with remaining space, and the amount column at about 7rem with right-aligned text
- **THEN** the merchant/name value SHALL still be rendered via `truncateInline` to keep a single line, while the description column uses the existing `DescriptionEditor` within an overflow-safe wrapper so editing remains possible without breaking the new grid-like rhythm
>>>>>>> theirs

#### Scenario: Selection spacing and responsiveness remain usable
- **GIVEN** the same transactions table renders beside the filter controls
- **WHEN** the viewport narrows toward tablet sizes
<<<<<<< ours
- **THEN** the checkbox column SHALL keep horizontal padding (e.g., `px-1`/`px-2`) so the date column never abuts it, the category/status badges keep their allocated width, the description column SHRINKS but never below its minimum (triggering multi-line wrapping instead of horizontal scroll), and the amount stays right-aligned and visible without forcing the whole table to overflow
=======
- **THEN** the checkbox column SHALL maintain horizontal padding (e.g., `px-1`/`px-2`) so the date column never touches the checkbox, the category and status badges keep their allocated width, and the description column SHRINKS but never below its minimum width (columns should scroll horizontally instead of collapsing), while the amount stays right-aligned and visible
>>>>>>> theirs
