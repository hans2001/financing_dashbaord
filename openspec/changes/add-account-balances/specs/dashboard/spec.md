## ADDED Requirements
### Requirement: Plaid balances are persisted for every linked account
`app/api/plaid/exchange-public-token` and `app/api/transactions/sync` SHALL call Plaid's `accountsBalanceGet` for each bank item access token and update the related `Account` rows with `currentBalance`, `availableBalance`, `creditLimit`, and `balanceLastUpdated` timestamps.

#### Scenario: Balance fields populate during link and sync
- **WHEN** a new public token is exchanged or a manual sync runs,
- **THEN** the server MUST retrieve balances for every account under the affected item, write the latest `current`, `available`, and `limit` numbers (or `null` when Plaid omits them), and store the timestamp that Plaid returned.

#### Scenario: Missing Plaid values stay nullable
- **WHEN** Plaid omits `available`, `limit`, or both,
- **THEN** the persisted record MUST set that column to `null` while still refreshing the other fields so downstream consumers can detect which numbers are safe to display.

### Requirement: Accounts API exposes balances with freshness metadata
`/api/accounts` SHALL include the persisted balance fields plus an ISO timestamp so the UI knows when the numbers were last refreshed.

#### Scenario: Accounts payload includes balance + freshness
- **WHEN** the dashboard fetches `/api/accounts`,
- **THEN** each `account` object MUST contain `currentBalance`, `availableBalance`, `creditLimit`, and `balanceLastUpdated` (ISO 8601 string or `null`) alongside the existing metadata.

#### Scenario: React Query consumers can detect stale data
- **WHEN** `balanceLastUpdated` is more than 24 hours old,
- **THEN** the hook SHALL expose a boolean (e.g., `isBalanceStale`) so UI surfaces a "Refresh needed" hint without re-deriving the threshold in every component.

### Requirement: Linked accounts panel displays balances with fallbacks
The "Linked accounts" panel on `app/dashboard/page.tsx` SHALL render formatted balances next to each account card, including a stale indicator when data exceeds the freshness threshold.

#### Scenario: Available/current/limit formatting
- **WHEN** an account has `currentBalance` (and optionally `availableBalance` or `creditLimit`),
- **THEN** the panel MUST format the values with `formatCurrency`, prefer showing both available and current for depository accounts, and show `creditLimit` for credit cards; if a value is `null`, render `--` while keeping the rest of the metadata.

#### Scenario: Stale balances show refresh hint
- **WHEN** `isBalanceStale` is true for an account,
- **THEN** the panel MUST display a subtle "Stale" chip or tooltip plus a "Refresh" CTA that triggers the existing sync flow.

### Requirement: Balances stay covered by automated tests
Vitest SHALL cover balance ingestion, serialization, and rendering to prevent regressions.

#### Scenario: API tests assert balance persistence
- **WHEN** tests stub Plaid responses with balance payloads,
- **THEN** they MUST verify we upsert the numeric fields, return them from `/api/accounts`, and mark stale data appropriately.

#### Scenario: Component/hook tests cover UI fallbacks
- **WHEN** the linked-accounts panel or hook tests run,
- **THEN** they MUST validate formatting, fallback rendering, and stale-indicator behavior for combinations of available/current/limit values.
