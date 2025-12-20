import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetMocks } from "../test-utils/mocks";

const verifyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("argon2", () => ({
  verify: verifyMock,
}));

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "vitest-secret";

type AuthModule = typeof import("@/lib/auth");
type AuthOptions = ReturnType<AuthModule["getAuthOptions"]>;
type CredentialsAuthorize = NonNullable<
  AuthOptions["providers"][number]["options"]["authorize"]
>;

let authorize: CredentialsAuthorize;

describe("lib/auth credentials provider", () => {
  beforeAll(async () => {
    const { getAuthOptions } = await import("@/lib/auth");
    const provider = getAuthOptions().providers?.[0];
    const authorizeFn = provider?.options?.authorize;
    if (!authorizeFn) {
      throw new Error("Credentials provider is missing");
    }
    authorize = authorizeFn;
  });

  beforeEach(() => {
    verifyMock.mockReset();
    resetMocks();
  });

  it("returns null when credentials are missing", async () => {
    const result = await authorize({ email: "", password: "" });
    expect(result).toBeNull();
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  it("returns null when the user is inactive", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      passwordHash: "secret",
      isActive: false,
    });

    const result = await authorize({
      email: "user@example.com",
      password: "pass",
    });

    expect(result).toBeNull();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns null when password verification fails", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      passwordHash: "secret",
      isActive: true,
    });
    verifyMock.mockResolvedValue(false);

    const result = await authorize({
      email: "user@example.com",
      password: "wrong",
    });

    expect(result).toBeNull();
    expect(verifyMock).toHaveBeenCalledWith("secret", "wrong");
  });

  it("returns the normalized user when credentials validate", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      passwordHash: "secret",
      isActive: true,
    });
    verifyMock.mockResolvedValue(true);

    const result = await authorize({
      email: "user@example.com",
      password: "pass",
    });
    expect(result).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
    });
    expect(verifyMock).toHaveBeenCalledWith("secret", "pass");
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
  });
});
