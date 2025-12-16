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

### Requirement: Logout and session refresh maintain the gate
The dashboard SHALL expose a logout action that clears the NextAuth session cookie and sends the user back to `/auth/login`, ensuring any subsequent dashboard/API access sees the login form again.

#### Scenario: Sign-out resets access
- **WHEN** the user explicitly signs out from the dashboard (e.g., via a header/page control)
- **THEN** the system SHALL call `signOut`, delete the session cookie, and redirect the browser to `/auth/login`
- **AND** any pinned routes (dashboard, APIs) SHALL continue returning 401/redirect responses until valid credentials are supplied again
