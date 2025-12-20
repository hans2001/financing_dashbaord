import { defaultTestSession, setTestSession } from "./test-utils/test-session";

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "vitest-secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/finance_dashboard_test";

setTestSession(defaultTestSession);
