## ADDED Requirements

### Requirement: Persist named account views as first-class objects
The system SHALL allow each authenticated user to persist a named account view as a database-backed object that captures their selected linked accounts, filter state, and presentation preferences so views can be reloaded later without recreating each option.

#### Scenario: create a view that binds to specific accounts
- **WHEN** Hans selects two checking accounts, picks the current month, applies a “spending only” filter, and names the configuration “Hans essentials”
- **THEN** the client SHALL POST the selection metadata to the saved-view API, the API SHALL store the row with the user ID and account bindings, and the response SHALL return a stable identifier that the UI uses to list the view in the Accounts & Spending panel.

### Requirement: Load views immediately in the Accounts & Spending view
The Accounts & Spending controls SHALL show every view the current user has created and SHALL allow the user to apply one with a single click so the dashboard automatically sets the account bindings, filters, and table state without extra workspace UI.

#### Scenario: apply a saved view to rehydrate state
- **WHEN** Yuki opens the dashboard and clicks her “Investing snapshot” view from the Accounts & Spending controls
- **THEN** the client SHALL fetch the view metadata from the saved-view API, set the selected accounts/filters to match the saved settings, fetch the updated transactions, and highlight the applied view as active.

### Requirement: CRUD operations for saved views
The system SHALL expose authenticated APIs to list, update, and delete saved views so the client can keep the Accounts & Spending controls synchronized with what lives in the database.

#### Scenario: rename or delete a view without touching filters
- **WHEN** a user renames “Quarterly checks” to “Quarterly snapshot” or deletes an outdated view
- **THEN** the API SHALL persist the change, the Accounts & Spending controls SHALL refresh the view list immediately, and any active selection SHALL continue using the updated metadata or fall back to defaults if a deleted view was active.

### Requirement: Surfaces saved views as account groupings without explicit roles
Saved views SHALL be the primary way for a user to group accounts together rather than relying on predefined roles or workspace switches, so they can easily switch between perspectives by reusing their previously defined bindings.

#### Scenario: inspect different account groupings via views
- **WHEN** a user opens the account list, selects “taxable accounts,” “savings only,” or “family plan” from the view menu
- **THEN** the dashboard SHALL immediately update the account bindings and filters to reflect the saved definition so the user can inspect different groupings without ever leaving the Accounts & Spending section.

### Requirement: Returned views include metadata for the Accounts & Spending UI
The saved-view API SHALL return metadata such as view names, pinned flag, and the list of linked accounts so the client can render them in the Accounts & Spending interface consistently with the rest of the dashboard controls.

#### Scenario: render view metadata in the control
- **WHEN** the Accounts & Spending controls query the saved-view list
- **THEN** the API SHALL respond with each view’s identifier, name, pinned status, and account bindings so the UI can display the name, highlight pinned items, and know which accounts to select when the view is applied.
