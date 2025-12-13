## 1. Implementation
- [ ] 1.1 Add a `SavedView`/`Workspace` model to Prisma with JSON metadata for filters, columns, and default flags plus the required migration.
- [ ] 1.2 Add APIs and a dashboard surface that let a family member assign linked accounts to their profile so saved views and filters can be scoped per user before the view selector loads.
- [ ] 1.3 Build authenticated API routes for listing, creating/updating, deleting, and activating saved views for a user; ensure they reuse `authorizeRequest` and surface clear validation errors.
- [ ] 1.4 Refactor dashboard state/hooks/components so the UI exposes saved-view controls, applies persisted filters/columns when a view is selected, and persists new/pinned views via the API.
- [ ] 1.5 Introduce unit/integration tests for the new API and UI flows plus regression tests for `useDashboardState` helpers, aiming to cover the new saved-view mutations.

## 2. Documentation & Validation
- [ ] 2.1 Update the OpenSpec capability (`dashboard-saved-views`) with the delta spec, and run `openspec validate add-saved-views --strict`.
- [ ] 2.2 Add usage notes (README or dashboard docs) describing how to create, pin, and switch shared workspaces.
