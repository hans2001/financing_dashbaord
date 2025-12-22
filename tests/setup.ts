import { defaultTestSession, setTestSession } from "./test-utils/test-session";

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "vitest-secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:Hans13802704833!@db.davyddzkiqpktymqvbpz.supabase.co:5432/postgres";

setTestSession(defaultTestSession);
