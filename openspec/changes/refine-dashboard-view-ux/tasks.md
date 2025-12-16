## 1. Implementation
- [ ] 1.1 Draft `ViewSelectorRow` and primary view container components (per view) so each component lives in its own file with isolated helpers.
- [ ] 1.2 Reduce `app/dashboard/page.tsx` to a layout that renders the selector row plus the selected view, keeping filter summaries lightweight and only showing attached accounts/filters necessary for the current view.
- [ ] 1.3 Identify shared utilities (e.g., view metadata, account formatting) and keep them in `components/dashboard/dashboard-utils.ts`.

## 2. Validation
- [ ] 2.1 Add `openspec/changes/refine-dashboard-view-ux/specs/dashboard-views/spec.md` describing the new UX requirements and scenarios.
- [ ] 2.2 Run `openspec validate refine-dashboard-view-ux --strict` once the spec and tasks are filled in.
