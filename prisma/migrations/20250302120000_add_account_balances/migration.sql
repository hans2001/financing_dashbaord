-- Add balance tracking columns to Account
ALTER TABLE "Account"
  ADD COLUMN "currentBalance" DECIMAL,
  ADD COLUMN "availableBalance" DECIMAL,
  ADD COLUMN "creditLimit" DECIMAL,
  ADD COLUMN "balanceLastUpdated" TIMESTAMP(3);
