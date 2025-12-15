# Change: Compact home introduction grid

## Why
- The landing page is too spacious compared to other screens and the intro messaging is vertically stacked, which makes it harder to scan quickly.
- We want to match the style of the dashboard pages and present the three setup messages (family view, quick connect, filter insights) in a compact single row that lines up with the surrounding content.

## What Changes
- Adjust the hero section on `app/page.tsx` to tighten spacing, place the three intro cards in a responsive row, and use the provided uppercase headings/copy.
- Ensure the introduction grid still collapses gracefully on smaller viewports while staying aligned with the rest of the page.
- Verify styles stay consistent with the existing design tokens (rounded containers, neutral borders, and typography).

## Impact
- Affected specs: home
- Affected code: `app/page.tsx`
