# Transactions Table Compact Layout

## Motivation
The dashboard transaction grid previously felt looser than the summary panels, so a full-height card displayed fewer rows even though the filter card above it had similar density. We want to surface as many rows per page as possible through purely visual tweaks so the filtering UX does not need to change.

## Visual changes
1. **Reduce padding and font size.** Every header cell now uses `py-0` while body cells rely on `py-0` plus tight typography (`text-[0.7rem]`) so each row uses the bare minimum vertical space without losing readability.
2. **Tighten merchant/description columns.** The merchant column width dropped from `18rem` to `15rem`, and the description column now uses `11rem` with gap-0.5 so its inline editor fits without forcing extra height.
3. **Add a height-aware scroll frame.** The table is now wrapped in a `max-h-[60vh] overflow-y-auto` container nested under the existing horizontal scroll so the card can show more rows even when data grows, instead of pushing the pagination controls downward.
4. **Slim down category badges.** The pill labels now use smaller padding/typography so they follow the reduced row height without making the table feel heavier.
5. **Keep existing helpers unchanged.** Selection checkboxes, category badges, and the `DescriptionEditor` stay nested inside each row so their behavior is preserved.
6. **Restore status visibility.** The status column returns to show “Pending” vs “Posted” badges, so the timeline context is still available even with the denser layout.
7. **Align merchant/amount typography.** Merchant names now use the dashboard’s `font-sans` rhythm at `0.75rem` so they stay professional, while amount labels drop to `0.825rem` with a medium weight so the values remain clear but not oversized.

## Outcome
Users now see a denser transaction grid without altering filters. The new scroll frame keeps the pagination summary/paging controls visible at the bottom of the card while exposing more rows in the default viewport.
