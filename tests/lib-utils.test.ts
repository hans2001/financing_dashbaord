import { describe, expect, it, vi } from "vitest";

// Set DATABASE_URL before any imports that might load prisma
// This prevents errors when demo-user.ts imports prisma.ts
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Hans13802704833!@db.davyddzkiqpktymqvbpz.supabase.co:5432/postgres";

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
