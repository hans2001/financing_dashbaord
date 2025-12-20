## ADDED Requirements
### Requirement: Dashboard hero removed for a tighter top bar
The dashboard content SHALL begin immediately under `TopNavigation` without rendering the "Family Dashboard"/"Finances" hero block, and the spacing between the nav bar and overview shall be limited to a small controlled top padding so the first card stays visually adjacent to the nav bar without extra vertical bulk.

#### Scenario: Overview renders directly below navigation with minimal padding
- **GIVEN** a signed-in user visits `/dashboard`
- **WHEN** `DashboardShell` renders
- **THEN** it SHALL skip the hero header, render only the core layout (filters, transactions, summary, linked accounts), and keep the `<main>` top padding to a small amount (e.g., `pt-4`) so the cards remain close to the nav bar without feeling cramped.

### Requirement: Sign-out action lives beside navigation links
`TopNavigation` SHALL include the existing `LogoutButton` component immediately after the Dashboard link so the log-out action appears in the same inline group as other nav controls.

#### Scenario: Sign-out button stays adjacent to Dashboard link
- **GIVEN** the nav list contains a single `Dashboard` link and the user is authenticated
- **WHEN** the navigation renders
- **THEN** it SHALL place the `LogoutButton` right after the `Dashboard` link with matching vertical alignment, and clicking it SHALL call `signOut({ callbackUrl: "/auth/login" })` so the user leaves the dashboard without additional spacing or wrappers.
