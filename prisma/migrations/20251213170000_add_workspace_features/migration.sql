-- Add member display names so the workspace UI can render friendly labels
ALTER TABLE "User"
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "activeSavedViewId" TEXT;

-- Saved views capture column preferences and filters for each family member
CREATE TABLE "SavedView" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  "isFamilyView" BOOLEAN NOT NULL DEFAULT false,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  "columnConfig" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "SavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "SavedView_userId_idx" ON "SavedView"("userId");

-- Link the active saved view to each user (nullable so default view works)
ALTER TABLE "User"
  ADD CONSTRAINT "User_activeSavedViewId_fkey"
  FOREIGN KEY ("activeSavedViewId") REFERENCES "SavedView"(id) ON DELETE SET NULL;

-- Assignment table lets parents control which accounts show up per workspace
CREATE TABLE "AccountAssignment" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AccountAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "AccountAssignment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "AccountAssignment_userId_accountId_key"
  ON "AccountAssignment"("userId", "accountId");
