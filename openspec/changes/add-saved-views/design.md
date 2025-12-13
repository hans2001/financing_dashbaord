## Context
Users (Hans, Yuki, etc.) already have the ability to link financial accounts and browse them via the dashboard. The existing saved-view work aimed to let each member manage a “workspace” with claimed accounts, family view defaults, and view metadata. The new direction is flatter: instead of distinct workspaces or roles, every user merely creates and reuses named “account views” that persist selections in the database and instantly drive the Accounts & Spending section.

## Goals / Non-Goals
- Goals:
  - Let any authenticated user capture a set of accounts, filters, and presentation preferences as a named view.
  - Persist those views as concrete data objects in the workspace database (account bindings, view metadata, active view pointer, etc.).
  - Provide APIs to list, apply, and delete views so the Accounts & Spending controls can load them without extra workspace context.
- Non-Goals:
  - Treating “family view” as a separate workspace with shared defaults.
  - Introducing explicit user roles outside of what the database already provides.

## Decisions
- Decision: Store each view as a database row that references the user and the linked accounts it controls. This keeps the UI simple — selecting a view just loads that row, applies the account IDs, and refreshes the transactions.
- Decision: Remove the workspace toggle and focus on a single Accounts & Spending experience. Saved views become the mechanism for users to switch between perspectives rather than toggling between workspace tabs.
- Decision: Rely on the `/api/workspaces/views` API to return every saved view and its metadata (including selected accounts) so the client can drive the Accounts & Spending controls without a separate accounts endpoint.

## Risks / Trade-offs
- Risk: Without the “family view” workspace, we need to seed a sensible default view or metadata so new users still see aggregated accounts the first time they land on the dashboard.
- Risk: Persisting every filter and account selection in the DB increases writes; mitigate by deduplicating on client side and only saving when metadata changes meaningfully.

## Open Questions
- Should we pre-create a default “All accounts” view (pinned or read-only) so households always have an initial lens to start from, or let each user build views from scratch?
