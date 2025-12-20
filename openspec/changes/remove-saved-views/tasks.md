## 1. Implementation
- [ ] 1.1 Remove the `SavedView` model and the `activeSavedViewId`/`activeSavedView` relation from `prisma/schema.prisma`.
- [ ] 1.2 Add a migration (e.g., `20260502000000_remove_saved_views`) that drops the `SavedView` table plus the `activeSavedViewId` column and its foreign key from the `User` table so existing databases can migrate.
- [ ] 1.3 Update `tests/test-utils/mocks.ts` so the Prisma mock no longer exposes `savedView`, and touch any other tests that imported it (currently just this file).
- [ ] 1.4 Mark the TODO about scheduling the `SavedView` removal as done and update any docs that might still describe the feature.

## 2. Documentation & Verification
- [ ] 2.1 Ensure the spec/proposal documents and `docs/remove-manage-page-plan.md` reflect that saved views are gone (this change doc is part of that effort).
- [ ] 2.2 Run unit tests that rely on Prisma (e.g., `npm run test -- tests/api-endpoints.test.ts`) or at least keep the suite passing locally after the schema change; note any tests skipped because of the migration.
