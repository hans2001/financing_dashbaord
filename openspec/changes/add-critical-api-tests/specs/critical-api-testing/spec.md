## ADDED Requirements
### Requirement: Plaid link exit logging route
`POST /api/plaid/link-error` SHALL always log whatever payload Plaid sends and respond with an acknowledgement, even when the payload cannot be parsed cleanly.

#### Scenario: Plaid sends a valid JSON payload
- **GIVEN** Plaid posts a JSON body to `/api/plaid/link-error`
- **WHEN** the route processes the request
- **THEN** it SHALL return a 200 response with `{status: "logged"}` so the webhook can proceed without retrying

#### Scenario: Plaid sends invalid JSON and the log fails
- **GIVEN** the request body cannot be parsed as JSON or logging throws an error
- **WHEN** the route catches the exception
- **THEN** it SHALL respond with a 500 status and `{error: "Unable to log link exit"}` while surfacing the failure in the logs

### Requirement: Transactions trends endpoint enforces filters and buckets
`GET /api/transactions/trends` SHALL validate authentication, account filters, and user-supplied query parameters before returning aggregated daily buckets.

#### Scenario: Missing authentication yields 401
- **GIVEN** the user is not authenticated
- **WHEN** the trends route executes
- **THEN** it SHALL short-circuit with the `unauthorizedResponse()` payload and a 401 status so the dashboard can re-authenticate

#### Scenario: Invalid account filter is rejected
- **GIVEN** the user is authenticated but requests one or more unknown account IDs
- **WHEN** the route queries `prisma.account.findMany`
- **THEN** it SHALL return a 400 response with `{error: "Account filter not found"}` and skip running the trends query

#### Scenario: Valid flows produce normalized buckets
- **GIVEN** the user is authenticated and the query supplies filters and a flow param
- **WHEN** the route runs the aggregated `prisma.$queryRaw` bucket query
- **THEN** it SHALL return ISO dates with `spent` as the absolute value of negative totals and `income` as the positive sum for each bucket

### Requirement: Plaid client initialization respects configuration
`lib/plaid.ts` SHALL require `PLAID_CLIENT_ID` and `PLAID_SECRET` along with an optional `PLAID_ENV`, and SHALL pass them through to `PlaidApi` so the SDK uses the right environment.

#### Scenario: Missing Plaid credentials prevent startup
- **GIVEN** either `PLAID_CLIENT_ID` or `PLAID_SECRET` is absent
- **WHEN** the module is imported
- **THEN** it SHALL throw an error mentioning both keys must be set and fail fast

#### Scenario: Configured values propagate to PlaidApi
- **GIVEN** the environment defines `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV`
- **WHEN** the module constructs the `Configuration`
- **THEN** it SHALL include the proper base path and header values so any downstream consumer hits Plaid with the configured credentials

### Requirement: Session helpers normalize user info and unauthorized responses
`lib/server/session.ts` SHALL wrap `next-auth` to return a clean user payload when available and provide a consistent 401 response when a session is missing.

#### Scenario: Session helper anonymizes missing session
- **GIVEN** `getServerSession` returns `undefined`
- **WHEN** `getAuthenticatedUser()` runs
- **THEN** it SHALL return `null` and `unauthorizedResponse()` SHALL produce a 401 JSON payload

#### Scenario: Session helper returns sanitized payload
- **GIVEN** the session contains `id`, `email`, and `name`
- **WHEN** `getAuthenticatedUser()` runs
- **THEN** it SHALL return an object with `id`, `email`, and `name` (defaulting to `null` when values are missing) so downstream callers have a predictable shape

### Requirement: Protected dashboard APIs refuse anonymous callers
The transaction listing, summary, category, sync, description update, and family-member routes SHALL guard with `getAuthenticatedUser()` and return the consistent `unauthorizedResponse()` payload before touching resources so unauthenticated requests cannot jailbreak into user data.

#### Scenario: Anonymous requests get a uniform 401
- **GIVEN** the NextAuth session is absent (e.g., `NEXTAUTH_TEST_SESSION` is `"null"`)
- **WHEN** one of the protected routes (`/api/transactions`, `/api/transactions/summary`, `/api/transactions/categories`, `/api/transactions/sync`, `/api/transactions/[transactionId]/description`, or `/api/family-members`) executes
- **THEN** it SHALL short-circuit with a 401 and `{error: "Unauthorized access"}` before invoking Prisma or Plaid so data cannot be exfiltrated without credentials
