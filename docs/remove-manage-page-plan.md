# Remove the Manage workspace surface

The Manage workspace UI and its supporting endpoints add a lot of surface area (Saved views, account bindings, dedicated navigation) but no one is using it anymore. Removing it lets the dashboard focus on the single `/dashboard` route, keeps `useDashboardState` lean, and trims unused API routes.

## Scope
- Delete `app/dashboard/manage/page.tsx` and `ManageWorkspace`, plus the `/dashboard/manage` nav link.
- Drop the `app/api/workspaces/views` endpoints (`GET`, `POST`, `DELETE`, and the activate route) and the helper imports that support them.
- Strip saved-view state from `useDashboardState`, delete `useSavedViewsState`, and remove the workspace-specific types/metadata helpers.
- Clean up docs/TODO/descriptions that still mention the Manage surface.
- Stop returning `activeSavedViewId` from the family-members API so the response only includes the basic member details.
- Remove the Vitest coverage that touches the saved-view APIs and adjust any other tests that inspect `activeSavedViewId`/workspace responses.

## Approach
1. Remove the Manage page directory, `ManageWorkspace`, and the navigation link so no route targets `/dashboard/manage`.
2. Delete every `/api/workspaces/views` route, the activate route, and their tests; keep only the family auth/family-members helpers that still exist.
3. Simplify `useDashboardState` by removing saved-view hooks, metadata helpers, and exports; delete `useSavedViewsState` plus the workspace types file.
4. Trim the family-members response so it no longer advertises an `activeSavedViewId`, matching the stripped-down member contract.
5. Update docs/TODO entries that mention saved views/manage workspaces to avoid references to removed UI.
6. Run linters/tests covering API endpoints so we know the rest of the suite still passes.

## Verification
- `npm run lint` (if fast) or at least `npm test -- --runInBand`? (maybe heavy). Instead run the targeted test suite already covering API routes: `npm run test -- --runInBand tests/api-endpoints.test.ts`.
- Manual smoke: open the dashboard (not possible here).

## Status
- Saved views and the manage workspace surface were removed via `openspec/changes/remove-saved-views`; keep this doc for historical context but rely on the change folder for implementation details.
