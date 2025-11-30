CREATE TABLE "User" (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "BankItem" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "plaidItemId" TEXT NOT NULL UNIQUE,
  "institutionId" TEXT,
  "institutionName" TEXT,
  "accessToken" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT BankItem_userId_fkey FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX BankItem_userId_idx ON "BankItem"("userId");

CREATE TABLE "Account" (
  id TEXT NOT NULL PRIMARY KEY,
  "bankItemId" TEXT NOT NULL,
  "plaidAccountId" TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  "officialName" TEXT,
  mask TEXT,
  type TEXT NOT NULL,
  subtype TEXT,
  currency TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT Account_bankItemId_fkey FOREIGN KEY ("bankItemId") REFERENCES "BankItem"(id) ON DELETE CASCADE
);
CREATE INDEX Account_bankItemId_idx ON "Account"("bankItemId");

CREATE TABLE "Transaction" (
  id TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "plaidTransactionId" TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  "merchantName" TEXT,
  amount NUMERIC NOT NULL,
  "isoCurrencyCode" TEXT,
  pending BOOLEAN NOT NULL,
  category TEXT[] NOT NULL DEFAULT '{}',
  raw JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT Transaction_accountId_fkey FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE CASCADE
);
CREATE INDEX Transaction_accountId_idx ON "Transaction"("accountId");
CREATE INDEX Transaction_date_idx ON "Transaction"(date DESC);
