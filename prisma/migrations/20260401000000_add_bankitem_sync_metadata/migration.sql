-- Add sync metadata to BankItem so we can skip redundant Plaid calls.
ALTER TABLE "BankItem"
ADD COLUMN "lastSyncedRequestId" TEXT;
ALTER TABLE "BankItem"
ADD COLUMN "lastSyncedTotalTransactions" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BankItem"
ADD COLUMN "lastSyncedAt" TIMESTAMPTZ NULL;
