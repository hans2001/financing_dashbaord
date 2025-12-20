import type { AuthenticatedUser } from "@/lib/server/session";

export const defaultTestSession: AuthenticatedUser = {
  id: "demo-user",
  email: "demo@family.test",
  name: "Family",
};

export function setTestSession(session: AuthenticatedUser | null) {
  globalThis.__TEST_AUTH_SESSION = session;
}

export function clearTestSession() {
  delete globalThis.__TEST_AUTH_SESSION;
}
