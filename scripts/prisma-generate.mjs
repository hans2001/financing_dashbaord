import { spawnSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:Hans13802704833!@db.davyddzkiqpktymqvbpz.supabase.co:5432/postgres";

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
  },
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
