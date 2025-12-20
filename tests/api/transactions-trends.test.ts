import { describe, expect, it, beforeEach, vi } from "vitest";
import { Prisma } from "@prisma/client";

import { prismaMock, resetMocks } from "../test-utils/mocks";
import { setTestSession } from "../test-utils/test-session";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("transactions trends endpoint", () => {
  beforeEach(() => {
    resetMocks();
    setTestSession({
      id: "user-1",
      email: "user@example.com",
      name: "Test",
    });
  });

  it("denies access when the user is not authenticated", async () => {
    setTestSession(null);

    const { GET } = await import("@/app/api/transactions/trends/route");
    const response = await GET(
      new Request("http://localhost/api/transactions/trends"),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized access" });
  });

  it("rejects unknown account filters", async () => {
    prismaMock.account.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/transactions/trends/route");
    const response = await GET(
      new Request(
        "http://localhost/api/transactions/trends?accountId=missing",
      ),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Account filter not found" });
  });

  it("returns normalized buckets for valid requests", async () => {
    prismaMock.account.findMany.mockResolvedValue([{ id: "account-1" }]);
    prismaMock.$queryRaw.mockResolvedValue([
      {
        bucket: new Date("2025-01-01T00:00:00Z"),
        spend_total: new Prisma.Decimal("-50"),
        income_total: new Prisma.Decimal("100"),
      },
    ]);

    const { GET } = await import("@/app/api/transactions/trends/route");
    const response = await GET(
      new Request(
        "http://localhost/api/transactions/trends?accountId=account-1&flow=spending&startDate=2025-01-01&endDate=2025-01-02&category=Dining",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      buckets: [
        { date: "2025-01-01", spent: 50, income: 100 },
      ],
    });
    expect(prismaMock.$queryRaw).toHaveBeenCalled();
  });
});
