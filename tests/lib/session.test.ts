import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { clearTestSession } from "@/tests/test-utils/test-session";

const getServerSessionMock = vi.fn();

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

describe("lib/server/session", () => {
  beforeEach(() => {
    vi.resetModules();
    getServerSessionMock.mockReset();
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.DATABASE_URL = "file:memory:?cache=shared";
    clearTestSession();
  });

  afterEach(() => {
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.DATABASE_URL;
    clearTestSession();
  });

  it("returns null when no session exists", async () => {
    getServerSessionMock.mockResolvedValue(undefined);
    clearTestSession();
    const { getAuthenticatedUser } = await import("@/lib/server/session");
    expect(await getAuthenticatedUser()).toBeNull();
  });

  it("normalizes the authenticated user when present", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com", name: "User" },
    });
    clearTestSession();
    const { getAuthenticatedUser } = await import("@/lib/server/session");
    expect(await getAuthenticatedUser()).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
    });
  });

  it("returns a 401 payload from unauthorizedResponse", async () => {
    const { unauthorizedResponse } = await import("@/lib/server/session");
    const response = unauthorizedResponse("Denied");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Denied" });
  });
});
