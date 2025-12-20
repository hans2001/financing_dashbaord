## MODIFIED Requirements
### Requirement: Dashboard and its data APIs require a verified session
Every visit to `/dashboard` and every API route it relies on (`/api/transactions`, `/api/accounts`, `/api/transactions/summary`, etc.) SHALL verify that `getServerSession(authOptions)` returns a logged-in user before returning any personal data, so the previous shared-family secret never needs to travel over the wire in client bundles; shortcuts such as `NEXTAUTH_TEST_SESSION` SHALL be ignored and only explicit test fixtures that assign `globalThis.__TEST_AUTH_SESSION` in a controlled test harness shall be allowed to bypass authentication for automated suites.

#### Scenario: Redirect anonymous dashboard visitors
- **WHEN** an HTTP GET request arrives at `/dashboard` without a NextAuth session cookie
- **THEN** the server SHALL respond with a redirect to `/auth/login` (or the configured sign-in page) and never render the dashboard markup or issue any family secret cookies
- **AND** the response SHALL omit any sensitive data and the client SHALL see the login screen as soon as the redirect completes

#### Scenario: API routes reject unauthorized requests
- **WHEN** any dashboard-backed API endpoint receives a request without a valid NextAuth session (or with a session tied to a disabled user)
- **THEN** the endpoint SHALL respond with a 401/403 payload that clearly states the request is unauthorized
- **AND** no row data, summaries, or synced payloads SHALL be returned

#### Scenario: Automated suites opt into a controlled test hook
- **WHEN** the test harness needs to run dashboard APIs in Vitest
- **THEN** the suite SHALL explicitly assign `globalThis.__TEST_AUTH_SESSION` before calling any route
- **AND** any other attempts to fake authentication via environment variables such as `NEXTAUTH_TEST_SESSION` SHALL be ignored so the guarded logic always exercises the real NextAuth gate
