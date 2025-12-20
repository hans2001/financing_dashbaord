#!/usr/bin/env node

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { hash } from "argon2";

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

const AUTH_EMAIL = process.env.AUTH_DEFAULT_EMAIL;
const AUTH_PASSWORD = process.env.AUTH_DEFAULT_PASSWORD;
const AUTH_DISPLAY_NAME =
  process.env.AUTH_DEFAULT_DISPLAY_NAME ?? "Family Dashboard";
const AUTH_ROLE = process.env.AUTH_DEFAULT_ROLE ?? "family";

if (!AUTH_EMAIL || !AUTH_PASSWORD) {
  throw new Error(
    "AUTH_DEFAULT_EMAIL and AUTH_DEFAULT_PASSWORD must be set",
  );
}

async function main() {
  const normalizedEmail = AUTH_EMAIL.trim().toLowerCase();
  const passwordHash = await hash(AUTH_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      displayName: AUTH_DISPLAY_NAME,
      passwordHash,
      isActive: true,
      role: AUTH_ROLE,
    },
    create: {
      email: normalizedEmail,
      displayName: AUTH_DISPLAY_NAME,
      passwordHash,
      isActive: true,
      role: AUTH_ROLE,
    },
  });

  console.log("Upserted authentication user:");
  console.log({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create authentication user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
