import { describe, expect, it } from "vitest";

import { getPieCategories } from "@/components/dashboard/SummaryPanel";

describe("getPieCategories", () => {
  it("includes every entry even when there are many categories", () => {
    const categories: [string, number][] = [
      ["Food", 150],
      ["Groceries", 100],
      ["Rent", 80],
      ["Transportation", 60],
      ["Health", 30],
      ["Miscellaneous", 20],
    ];

    expect(getPieCategories(categories)).toEqual(categories);
  });

  it("returns an empty array when no categories are provided", () => {
    expect(getPieCategories([])).toEqual([]);
  });
});
