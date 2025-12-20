## ADDED Requirements
### Requirement: Schema no longer exposes saved views or active pointers
The Prisma schema SHALL drop the `SavedView` model plus the `activeSavedViewId`/`activeSavedView` relation so the generated client, migrations, and runtime code no longer depend on those types.

#### Scenario: `prisma migrate status` after the change
- **WHEN** the team generates migrations or inspects the schema after this change
- **THEN** there is no `SavedView` block in `prisma/schema.prisma`, the `User` model only lists the current fields, and `npx prisma db push`/` migrate deploy` completes without touching saved-view artifacts.

### Requirement: APIs operate without the saved-view column
Endpoints that previously surfaced `activeSavedViewId` SHALL omit it and rely solely on the core user fields so clients cannot depend on removed data.

#### Scenario: Family member responses
- **WHEN** `/api/family-members` responds to a GET or POST request
- **THEN** each member object only contains `id` and `displayName`, matching the simplified contract documented in `docs/remove-manage-page-plan.md`.

### Requirement: Tests do not mock saved views
Shared test helpers SHALL not require a `savedView` collection or reference `SavedView` data so the suite stays accurate after the schema drop.

#### Scenario: Vitest helpers rebuild Prisma mock
- **WHEN** `tests/test-utils/mocks.ts` resets the Prisma mock
- **THEN** the `prismaMock` object only contains `account`, `transaction`, `bankItem`, and `user` collections; there is no `savedView` key that could mislead new tests or cause TypeScript errors when the model disappears.
