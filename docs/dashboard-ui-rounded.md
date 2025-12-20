# Dashboard UI Rounded Corners

## Goal
- reduce the overly soft corners across dashboard cards and controls so the interface reads as more professional and finance-focused.

-## Scope
- adjust the dashboard grid (summary, filters, transactions) wrappers that currently use `rounded-3xl`/`rounded-2xl`.
- tone down highly rounded pills and badges (`rounded-full`) to more restrained radius while keeping the overall layout.
- keep the existing tailwind utility stack and shared components, but favor `rounded-xl`, `rounded-lg`, or `rounded-md` for surfaces and controls.

## Implementation notes
- Update `app/dashboard/page.tsx`, `components/dashboard/FiltersPanel.tsx`, and `SummaryPanel.tsx` to use the new radius values.
- Replace `rounded-full` buttons/badges with `rounded-md`/`rounded-sm` where a more conservative radius feels appropriate.
- Ensure the style tokens used in multiple files stay consistent so future tweaks only require adjusting a few classes.

## Verification
- Visual review of dashboard surfaces and controls to confirm the style shift; no automated tests are planned.
