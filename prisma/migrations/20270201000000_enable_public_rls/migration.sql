-- Enable row level security on every table Supabase exposes so PostgREST cannot return data without an authenticated claim.
-- `_prisma_migrations` also gets RLS so the Supabase linter stops complaining; the policy only lets the service role manage the table.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can access own row" ON "User"
  FOR ALL
  USING (auth.uid()::uuid = "id" OR auth.role() = 'service_role')
  WITH CHECK (auth.uid()::uuid = "id" OR auth.role() = 'service_role');

ALTER TABLE "BankItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BankItem belongs to the authenticated user" ON "BankItem"
  FOR ALL
  USING (auth.uid()::uuid = "userId" OR auth.role() = 'service_role')
  WITH CHECK (auth.uid()::uuid = "userId" OR auth.role() = 'service_role');

ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Account is scoped via its BankItem" ON "Account"
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM "BankItem" bi
      WHERE bi."id" = "Account"."bankItemId"
        AND bi."userId" = auth.uid()::uuid
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM "BankItem" bi
      WHERE bi."id" = "Account"."bankItemId"
        AND bi."userId" = auth.uid()::uuid
    )
  );

ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transaction is scoped via its Account" ON "Transaction"
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM "Account" acct
      JOIN "BankItem" bi ON bi."id" = acct."bankItemId"
      WHERE acct."id" = "Transaction"."accountId"
        AND bi."userId" = auth.uid()::uuid
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM "Account" acct
      JOIN "BankItem" bi ON bi."id" = acct."bankItemId"
      WHERE acct."id" = "Transaction"."accountId"
        AND bi."userId" = auth.uid()::uuid
    )
  );

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role changes migrations" ON "_prisma_migrations"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
