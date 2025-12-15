## ADDED Requirements
### Requirement: Landing route immediately surfaces the Plaid Link flow
`GET /` SHALL render the same Plaid connect experience currently exposed at `/connect`, including the production messaging, launch button, and error reporting, so visitors can link accounts without clicking through from the hero.

#### Scenario: Root landing renders the Plaid connect panel
- **GIVEN** the existing Plaid Link UI works on `/connect`
- **WHEN** an unauthenticated user lands on `/`
- **THEN** the page MUST show the shared connect panel with the same headline, production copy, button states, and production notes, and the `Launch Plaid Link` button MUST activate the same token-driven flow that eventually pushes `/dashboard` on success.

### Requirement: The dedicated connect route keeps rendering the shared panel
`GET /connect` SHALL continue to render the same shared panel so that future variants or auth gating can re-use the dedicated URL without drifting from the landing experience.

#### Scenario: `/connect` remains functional after the merge
- **GIVEN** the shared `PlaidConnectPanel` replaces the root hero
- **WHEN** a user navigates to `/connect`
- **THEN** `/connect` MUST still mount the panel, populate the same link token, and exhibit the same success/error handling so the workflow stays aligned between both routes.
