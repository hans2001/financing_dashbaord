# Future iterations

## Dashboard experience

- [x] Add a monthly trend line chart (date → spent) so momentum can be tracked without exporting data.
- [ ] Treat pending credit-card charges as temporary (excluding them from summaries until they post) or automatically net them with the checking account debit so the dashboard mirrors real-world cash flow.
- [ ] Address all security concerns so unauthorized people cannot view the dashboard. (auth system)
- [x] Multi-select category filtering with snapshots on date range data, not just the visualized data.

## Architecture & modules

- [ ] Document the planned dashboard module refactor in `openspec/changes` (proposal + tasks) before coding per the project rule, then improve dashboard QA coverage (shared UI primitives audit, focused RTL/API tests) while staying inside that change.
- [x] Remove the SavedView model/`activeSavedViewId` column from `prisma/schema.prisma` with a migration so the schema matches the pared-down dashboard capabilities.

## Deployment

- [ ] Align TODO with the existing deployment plan (see `TODO.md:Platform & automation` notes/plan) so rollout steps stay tracked in this list.
