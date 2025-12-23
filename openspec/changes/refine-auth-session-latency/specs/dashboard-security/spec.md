## ADDED Requirements
### Requirement: Auth session latency budget
The authentication callback for credential sign-in SHALL respond within 3 seconds on a cold start under typical deployment load so login redirects feel responsive.

#### Scenario: Cold start login response
- **WHEN** a user submits valid credentials and the auth callback runs on a cold start
- **THEN** the response completes within 3 seconds before redirecting to `/dashboard`
