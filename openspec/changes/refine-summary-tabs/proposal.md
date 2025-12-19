# Change: Compact summary tabs

## Why
The “Categories” and “Trend” toggles in the summary card look oversized within the tight column on the right, which makes the entire panel feel bulky despite its already modest content. Shrinking their footprint will keep the tabs visible while letting surrounding components breathe.

## What Changes
- Adjust the `TabsList` container and individual `TabsTrigger` components inside `SummaryPanel` so they consume less vertical padding, use tighter letter spacing, and only grow as wide as their text.
- Shift the tabs to the top-right corner of the summary card so the control stays tucked away from the pie chart and trend canvas, ensuring the rest of the card layout remains unchanged.
- If a trigger label is noticeably longer than the compact buttons (e.g., “Categories”), swap it for a shorter alias that keeps the meaning but trims width; keep “Trend” as is if it already fits.
- Surface a context-aware descriptor above the tabs so each view (“Top categories” vs “Spending trend”) communicates what the user is seeing without adding extra chrome to the rest of the card.
- Layer in subtle spacing tweaks (smaller padding/margins) around the tabs and the surrounding card so the control feels compact but still accessible on desktop and smaller screens.
- Verify the tabs still render correctly in both “Categories” and “Trend” states and that the summary card height does not jump unexpectedly when the tabs are toggled.

## Impact
- Affected files: `components/dashboard/SummaryPanel.tsx`
