## ADDED Requirements
### Requirement: Dashboard cookie middleware
Dashboard routes SHALL be served through a Next.js middleware that enforces the `__Secure-family-secret` cookie so the client never needs to know the raw secret.

#### Scenario: Dashboard visit sets missing cookie
- **WHEN** a request hits `/dashboard` without the `__Secure-family-secret` cookie
- **THEN** the middleware injects the cookie using the server-only `FAMILY_AUTH_TOKEN` value with `HttpOnly`, `SameSite=Strict`, and secure attributes

#### Scenario: Existing cookie refreshes when stale
- **WHEN** a `/dashboard` request arrives with a cookie that does not match the current server secret
- **THEN** the middleware replaces it with the correct value so clients always stay synchronized
