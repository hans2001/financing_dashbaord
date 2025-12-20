import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;
let pool: Pool | undefined;
let prismaClient: PrismaClient | undefined;

if (databaseUrl) {
  pool =
    global.pgPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  const adapter = new PrismaPg(pool);
  prismaClient =
    global.prisma ??
    new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "warn", "error"]
          : ["warn", "error"],
    });
}

// Delay missing env errors until runtime so builds don't fail on import.
const prismaFallback = new Proxy({} as PrismaClient, {
  get() {
    throw new Error("DATABASE_URL must be set when initializing PrismaClient");
  },
});

export const prisma = prismaClient ?? prismaFallback;

if (process.env.NODE_ENV !== "production" && prismaClient && pool) {
  global.pgPool = pool;
  global.prisma = prismaClient;
}
