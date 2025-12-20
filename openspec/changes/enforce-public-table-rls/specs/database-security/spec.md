## ADDED Requirements
### Requirement: Public schema tables enforce authenticated row ownership
Every table that Supabase exposes (`User`, `BankItem`, `Account`, `Transaction`, and the Prisma metadata table `_prisma_migrations`) SHALL have row level security enabled and policies that restrict read/write to the owning user derived from `auth.uid()` while still permitting the service role or migration runner to manage the schema.

#### Scenario: Regular auth users only see their rows through PostgREST
- **GIVEN** a Supabase client is authenticated with a JWT whose `sub` claim matches one of the dashboard users,
- **WHEN** the client requests rows from `Transaction`, `Account`, or `BankItem`,
- **THEN** the RLS policies SHALL rely on joins back to the owning `User` row so the client only receives rows whose owner matches `auth.uid()` and the query succeeds without needing a strong service credential.

#### Scenario: Admin/migration operations are still permitted
- **GIVEN** the database receives a connection that bypasses RLS (e.g., the Prisma migration runner or the Supabase service role),
- **WHEN** it needs to read or mutate `_prisma_migrations`, `User`, `BankItem`, `Account`, or `Transaction`,
- **THEN** the policies SHALL allow those operations so deployments and background jobs continue to work while `auth.uid()`-based policies remain enforced for ordinary clients.
