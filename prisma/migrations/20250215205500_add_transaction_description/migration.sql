-- Add optional description column to transactions for inline notes
ALTER TABLE "Transaction"
ADD COLUMN "description" TEXT;
