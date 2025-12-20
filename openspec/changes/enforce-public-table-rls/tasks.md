## 1. Implementation
- [ ] 1.1 Draft and publish the `database-security` delta that requires the flagged tables to enable RLS with `auth.uid()` metadata.
- [ ] 1.2 Add a Prisma migration that enables RLS and creates per-table policies for `User`, `BankItem`, `Account`, `Transaction`, and `_prisma_migrations` (ensuring service role/migrations still work).
- [ ] 1.3 Update the deployment/security docs to call out the new policies and any manual steps developers must remember.
- [ ] 1.4 Validate the change with `openspec validate enable-public-table-rls --strict` so we can request approval.
