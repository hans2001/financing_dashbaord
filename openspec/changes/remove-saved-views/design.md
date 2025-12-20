## Context
The Manage workspace and saved-view experience was removed from the dashboard UI, but the database schema and test mocks still carry the `SavedView` model plus the `activeSavedViewId` pointer. That leftover schema is a maintenance burden and confuses future work because the Prisma client, migrations, and docs keep referencing entities the UI no longer uses.

## Goals / Non-Goals
- Goals:
  - Drop the `SavedView` model and `activeSavedViewId` field from `prisma/schema.prisma` so the database mirrors the simplified dashboard flows (filters/panels operate without persisted views).
  - Create a migration that removes the column, the foreign key, and the `SavedView` table so every deployment/CI run applies the same schema delta.
  - Update tests and docs so nothing references the vanished model or column and the TODO only tracks remaining work.
- Non-goals:
  - Reintroducing saved views or workspace-specific account assignments.
  - Touching unrelated dashboard refactors during this cleanup pass.

## Decisions
- Decision: Remove the database objects via migration rather than keeping them around; we will drop `User.activeSavedViewId` and the `SavedView` table with its constraints so Prisma accurately represents the current domain.
- Decision: Adjust mock utilities/tests to stop stubbing `savedView`, preventing stray references that could expect the object to exist.
- Decision: Treat this removal as a backend-only change (no new UI) and rely on `docs/remove-manage-page-plan.md` as contextual guidance instead of keeping the old account view endpoints alive.

## Risks / Trade-offs
- Risk: If any lingering code accidentally uses `SavedView`, removing the table will break Prisma queries. To mitigate, we will search the repo for references before the migration and update any remaining tests.

## Open Questions
- None for this removal—no new requirements are surfacing that relate to saved views.
