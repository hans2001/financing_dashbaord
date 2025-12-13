import { afterEach, describe, expect, it, vi } from "vitest";

// Set DATABASE_URL before any imports that might load prisma
// This prevents errors when demo-user.ts imports prisma.ts
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/test";

const setEnvValues = (values: Record<string, string | undefined>) => {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
};

vi.mock("@prisma/client", () => {
  class PrismaClient {
    constructor(public config?: Record<string, unknown>) {}
  }
  return { PrismaClient };
});

vi.mock("@prisma/adapter-pg", () => {
  class PrismaPg {
    constructor(public pool: unknown) {}
  }
  return { PrismaPg };
});

vi.mock("pg", () => {
  class Pool {
    constructor(public options: Record<string, unknown>) {}
  }
  return { Pool };
});

describe("jsonErrorResponse helper", () => {
  it("records the error and returns a structured response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { jsonErrorResponse } = await import("@/lib/api-response");

    const response = jsonErrorResponse(new Error("boom"), 418, {
      route: "lib-tests",
    });
    expect(response.status).toBe(418);
    const payload = await response.json();
    expect(payload).toEqual({ error: "boom" });
    expect(spy).toHaveBeenCalledWith(
      "[API ERROR]",
      expect.objectContaining({ route: "lib-tests" }),
    );
    spy.mockRestore();
  });
});

describe("family authorization utilities", () => {
  const loadFamilyAuthModule = async (
    overrides?: Record<string, string | undefined>,
  ) => {
    vi.resetModules();
    setEnvValues({
      FAMILY_AUTH_TOKEN: "family-dashboard-secret",
      NEXT_PUBLIC_FAMILY_AUTH_TOKEN: undefined,
      FAMILY_RATE_LIMIT_MAX: "60",
      FAMILY_RATE_LIMIT_WINDOW_MS: "60000",
      ...overrides,
    });
    const familyAuth = await import("@/lib/family-auth");
    familyAuth.resetFamilyRateLimit();
    return familyAuth;
  };

  it("throws during module load when the secret is missing or too short", async () => {
    vi.resetModules();
    setEnvValues({
      FAMILY_AUTH_TOKEN: undefined,
      NEXT_PUBLIC_FAMILY_AUTH_TOKEN: undefined,
    });
    await expect(import("@/lib/family-auth")).rejects.toThrow(
      "FAMILY_AUTH_TOKEN must be set",
    );

    vi.resetModules();
    setEnvValues({
      FAMILY_AUTH_TOKEN: "short",
      NEXT_PUBLIC_FAMILY_AUTH_TOKEN: undefined,
    });
    await expect(import("@/lib/family-auth")).rejects.toThrow(
      "FAMILY_AUTH_TOKEN must be at least 16 characters",
    );
  });

  it("allows requests that present the family secret header", async () => {
    const { DEMO_USER_ID } = await import("@/lib/demo-user");
    const familyAuth = await loadFamilyAuthModule();
    const secret = familyAuth.getFamilyHeaderValue();
    const request = new Request("https://example.com", {
      headers: { "x-family-secret": secret },
    });

    const result = familyAuth.authorizeRequest(request);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected authorization to succeed");
    }
    expect(result.token).toBe(secret);
    expect(result.userId).toBe(DEMO_USER_ID);
  });

  it("lets requesters set their user id via header", async () => {
    const familyAuth = await loadFamilyAuthModule();
    const secret = familyAuth.getFamilyHeaderValue();
    const request = new Request("https://example.com", {
      headers: {
        "x-family-secret": secret,
        "x-family-user-id": "hans",
      },
    });

    const result = familyAuth.authorizeRequest(request);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected authorization to succeed");
    }
    expect(result.userId).toBe("hans");
  });

  it("falls back to query userId when header is absent", async () => {
    const familyAuth = await loadFamilyAuthModule();
    const secret = familyAuth.getFamilyHeaderValue();
    const request = new Request(
      "https://example.com?userId=yuki",
      {
        headers: { "x-family-secret": secret },
      },
    );

    const result = familyAuth.authorizeRequest(request);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected authorization to succeed");
    }
    expect(result.userId).toBe("yuki");
  });

  it("denies requests without the header", async () => {
    const familyAuth = await loadFamilyAuthModule();
    const request = new Request("https://example.com");
    const response = familyAuth.authorizeRequest(request);
    expect(response.ok).toBe(false);
    if (response.ok) {
      throw new Error("Expected authorization to fail");
    }
    if (!response.response) {
      throw new Error("Expected error response to be provided");
    }
    const payload = await response.response.json();
    expect(payload).toEqual({ error: "Unauthorized access" });
    expect(response.response.status).toBe(403);
  });

  it("enforces rate limits when the same secret is used repeatedly", async () => {
    const familyAuth = await loadFamilyAuthModule({
      FAMILY_RATE_LIMIT_MAX: "1",
    });
    const secret = familyAuth.getFamilyHeaderValue();
    const request = new Request("https://example.com", {
      headers: { "x-family-secret": secret },
    });

    expect(familyAuth.authorizeRequest(request).ok).toBe(true);
    const second = familyAuth.authorizeRequest(request);
    expect(second.ok).toBe(false);
    if (second.ok) {
      throw new Error("Expected the second call to be throttled");
    }
    if (!second.response) {
      throw new Error("Expected rate-limit response to be defined");
    }
    expect(second.response.status).toBe(429);
    expect(await second.response.json()).toEqual({
      error: "Rate limit exceeded",
    });
  });

  it("rate limits invalid attempts per client IP", async () => {
    const familyAuth = await loadFamilyAuthModule({
      FAMILY_RATE_LIMIT_MAX: "1",
    });
    const request = new Request("https://example.com", {
      headers: { "x-family-secret": "wrong-secret" },
    });

    const first = familyAuth.authorizeRequest(request);
    expect(first.ok).toBe(false);
    if (first.ok) {
      throw new Error("Expected authorization to fail");
    }
    expect(first.response.status).toBe(403);

    const second = familyAuth.authorizeRequest(request);
    expect(second.ok).toBe(false);
    if (second.ok) {
      throw new Error("Expected rate limit to trigger");
    }
    expect(second.response.status).toBe(429);
  });

  it("authorizes requests that only have the secure cookie", async () => {
    const familyAuth = await loadFamilyAuthModule();
    const secret = familyAuth.getFamilyHeaderValue();
    const request = new Request("https://example.com", {
      headers: {
        cookie: `__Secure-family-secret=${secret}`,
      },
    });
    const result = familyAuth.authorizeRequest(request);
    expect(result.ok).toBe(true);
  });

  it("rate limits repeated invalid cookie attempts", async () => {
    const familyAuth = await loadFamilyAuthModule({
      FAMILY_RATE_LIMIT_MAX: "1",
    });
    const request = new Request("https://example.com", {
      headers: {
        cookie: "__Secure-family-secret=wrong",
      },
    });
    const first = familyAuth.authorizeRequest(request);
    expect(first.ok).toBe(false);
    if (first.ok) {
      throw new Error("Expected first cookie attempt to fail");
    }
    expect(first.response.status).toBe(403);
    const second = familyAuth.authorizeRequest(request);
    expect(second.ok).toBe(false);
    if (second.ok) {
      throw new Error("Expected rate limit for cookie attempt");
    }
    expect(second.response.status).toBe(429);
  });
});

describe("Prisma bootstrapper", () => {
  afterEach(() => {
    delete global.prisma;
    delete global.pgPool;
  });

  it("exports a Prisma client when DATABASE_URL is set", async () => {
    vi.resetModules();
    setEnvValues({
      DATABASE_URL: "postgresql://localhost:5432/db",
      NODE_ENV: "test",
    });
    const { prisma } = await import("@/lib/prisma");
    expect(prisma).toBeDefined();
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.resetModules();
    delete process.env.DATABASE_URL;
    await expect(import("@/lib/prisma")).rejects.toThrow(
      "DATABASE_URL must be set when initializing PrismaClient",
    );
  });
});
