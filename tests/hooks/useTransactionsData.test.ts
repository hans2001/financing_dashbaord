import { describe, expect, it } from "vitest";

import { buildTransactionsSearchParams } from "@/components/dashboard/hooks/useTransactionsData";

describe("buildTransactionsSearchParams", () => {
  it("includes each explicit account id before fetching", () => {
    const params = buildTransactionsSearchParams({
      selectedAccounts: ["checking", "checking", "savings"],
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      pageSize: 25,
      currentPage: 2,
      sortOption: "date_desc",
      flowFilter: "all",
      categoryFilter: "Groceries",
    });

    expect(params.getAll("accountId")).toEqual(["checking", "savings"]);
    expect(params.get("limit")).toBe("25");
    expect(params.get("offset")).toBe(String(2 * 25));
    expect(params.get("category")).toBe("Groceries");
    expect(params.get("sort")).toBe("date_desc");
  });

  it("drops account filters when the sentinel 'all' is selected", () => {
    const params = buildTransactionsSearchParams({
      selectedAccounts: ["all"],
      dateRange: { start: "2024-02-01", end: "2024-02-28" },
      pageSize: "all",
      currentPage: 5,
      sortOption: "amount_desc",
      flowFilter: "spending",
      categoryFilter: "all",
    });

    expect(params.getAll("accountId")).toEqual([]);
    expect(params.get("limit")).toBe("all");
    expect(params.get("offset")).toBe("0");
    expect(params.has("category")).toBe(false);
    expect(params.get("flow")).toBe("spending");
  });
});
