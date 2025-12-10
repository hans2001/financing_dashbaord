#!/usr/bin/env node

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const envFileCandidates = [".env.local", ".env"];
const envFile = envFileCandidates.find((candidate) =>
  fs.existsSync(path.resolve(candidate)),
);

if (envFile) {
  console.log(`Loading environment variables from ${envFile}`);
  const loaded = dotenv.config({ path: envFile });
  if (loaded.error) {
    throw loaded.error;
  }
} else {
  console.warn("No .env file found, continuing with process.env values");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool =
  globalThis._financeDashboardPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

globalThis._financeDashboardPool = pool;

const adapter = new PrismaPg(pool);

const prisma =
  globalThis._financeDashboardClient ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });

globalThis._financeDashboardClient = prisma;

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "demo-user";

async function main() {
  console.log("Refreshing bank items for user", DEMO_USER_ID);

  const transactionsDeleted = await prisma.transaction.deleteMany({
    where: {
      account: {
        bankItem: {
          userId: DEMO_USER_ID,
        },
      },
    },
  });

  const accountsDeleted = await prisma.account.deleteMany({
    where: {
      bankItem: {
        userId: DEMO_USER_ID,
      },
    },
  });

  const bankItemsDeleted = await prisma.bankItem.deleteMany({
    where: {
      userId: DEMO_USER_ID,
    },
  });

  console.log(
    `Removed ${transactionsDeleted.count} transactions, ${accountsDeleted.count} accounts, and ${bankItemsDeleted.count} bank items.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to refresh bank items:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
