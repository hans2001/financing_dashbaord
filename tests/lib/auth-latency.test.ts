import { performance } from "node:perf_hooks";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetMocks } from "../test-utils/mocks";

const verifyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("argon2", () => ({
  verify: verifyMock,
}));

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "vitest-secret";

describe("auth latency budget", () => {
  beforeEach(() => {
    verifyMock.mockReset();
    resetMocks();
  });

  it("responds within 3 seconds for credential callbacks", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      passwordHash: "secret",
      isActive: true,
    });
    verifyMock.mockResolvedValue(true);

    const { getAuthOptions } = await import("@/lib/auth");
    const provider = getAuthOptions().providers?.[0];
    const authorize = provider?.options?.authorize;
    if (!authorize) {
      throw new Error("Credentials provider is missing");
    }

    const start = performance.now();
    const result = await authorize({
      email: "user@example.com",
      password: "pass",
    });
    const duration = performance.now() - start;

    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
    });
    expect(duration).toBeLessThan(3000);
  });
});
