## ADDED Requirements
### Requirement: Dashboard and its data APIs require a verified session
Every visit to `/dashboard` and every API route it relies on (`/api/transactions`, `/api/accounts`, `/api/transactions/summary`, etc.) SHALL verify that `getServerSession(authOptions)` returns a logged-in user before returning any personal data, so the previous shared-family secret never needs to travel over the wire in client bundles.

#### Scenario: Redirect anonymous dashboard visitors
- **WHEN** an HTTP GET request arrives at `/dashboard` without a NextAuth session cookie
- **THEN** the server SHALL respond with a redirect to `/auth/login` (or the configured sign-in page) and never render the dashboard markup or issue any family secret cookies
- **AND** the response SHALL omit any sensitive data and the client SHALL see the login screen as soon as the redirect completes

#### Scenario: API routes reject unauthorized requests
- **WHEN** any dashboard-backed API endpoint receives a request without a valid NextAuth session (or with a session tied to a disabled user)
- **THEN** the endpoint SHALL respond with a 401/403 payload that clearly states the request is unauthorized
- **AND** no row data, summaries, or synced payloads SHALL be returned

### Requirement: Login page issues NextAuth sessions
The system SHALL expose an `/auth/login` experience that lets a family member submit verified credentials (§ hashed password stored in Prisma), calls NextAuth `signIn`, and surfaces server-side validation errors so only entered credentials that match a known user can establish a session cookie.

#### Scenario: Valid credentials grant access
- **WHEN** the user enters a known email/password and submits the login form
- **THEN** NextAuth SHALL create a new session, set the HttpOnly `next-auth.session-token` cookie, and redirect the browser to `/dashboard`
- **AND** any previously requested redirect target (e.g., `/dashboard` itself) SHALL be honored after the login completes

#### Scenario: Invalid credentials stay on the login form
- **WHEN** the user submits unknown credentials
- **THEN** the login page SHALL re-render with a clear error message and keep the email field populated so the user can retry without guessing
- **AND** no session cookie SHALL be issued, and the server SHALL return a 401/403 response from the NextAuth route

### Requirement: Plaid link flows require authenticated sessions
The Plaid Link lifecycle SHALL only operate when `getServerSession(authOptions)` returns a verified user; `/api/plaid/create-link-token` and `/api/plaid/exchange-public-token` SHALL reject requests without a next-auth session, and the landing or connect flow SHALL surface an authentication prompt instead of issuing any link tokens when the session is absent.

#### Scenario: Link token creation rejects anonymous callers
- **WHEN** a POST request is made to `/api/plaid/create-link-token` without a valid NextAuth session cookie
- **THEN** the endpoint SHALL respond with a 401/403 error body and never emit a `link_token`
- **AND** the client SHALL show a clear login prompt (or redirect to `/auth/login`) instead of opening Plaid Link

#### Scenario: Public token exchange rejects anonymous callers
- **WHEN** a POST request arrives at `/api/plaid/exchange-public-token` without a valid session user
- **THEN** the endpoint SHALL respond with a 401/403 payload without exchanging the public token
- **AND** no `BankItem` or account rows SHALL be created for any user

#### Scenario: Landing Plaid flow honors authentication
- **WHEN** an unauthenticated visitor lands on `/` or `/connect` and tries to launch Plaid Link
- **THEN** the link token fetch SHALL fail with an authentication error and the UI SHALL present a login call-to-action that routes to `/auth/login`
- **AND** no network trace SHALL leak family secrets such as working tokens or `FAMILY_AUTH_TOKEN` values

### Requirement: Logout and session refresh maintain the gate
The dashboard SHALL expose a logout action that clears the NextAuth session cookie and sends the user back to `/auth/login`, ensuring any subsequent dashboard/API access sees the login form again.

#### Scenario: Sign-out resets access
- **WHEN** the user explicitly signs out from the dashboard (e.g., via a header/page control)
- **THEN** the system SHALL call `signOut`, delete the session cookie, and redirect the browser to `/auth/login`
- **AND** any pinned routes (dashboard, APIs) SHALL continue returning 401/redirect responses until valid credentials are supplied again
