-- Drop the user pointer to saved views first so nothing references the table anymore.
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_activeSavedViewId_fkey";

-- DropColumn
ALTER TABLE "User" DROP COLUMN "activeSavedViewId";

-- Drop the saved views table itself.
-- DropForeignKey
ALTER TABLE "SavedView" DROP CONSTRAINT "SavedView_userId_fkey";

-- DropIndex
DROP INDEX "SavedView_userId_idx";

-- DropTable
DROP TABLE "SavedView";
