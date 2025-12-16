import { describe, expect, it } from "vitest";

import { getOverrideCategoryLabel } from "@/lib/transaction-category";

describe("transaction category overrides", () => {
  it("resolves Zelle transfers using the combined text", () => {
    const label = getOverrideCategoryLabel({
      merchantName: "Adv SafeBalance Bank",
      name: "Zelle payment from WENHAN JIANG",
    });
    expect(label).toBe("Business");
  });

  it("maps rewards credits to the Interests bucket", () => {
    const label = getOverrideCategoryLabel({
      merchantName: "Customized Cash Rewards Statement Credit",
    });
    expect(label).toBe("Interests");
  });

  it("catches local restaurants as Food", () => {
    const label = getOverrideCategoryLabel({
      merchantName: "Duangjai Thai Kitchen",
    });
    expect(label).toBe("Food");
  });

  it("recognizes interest earned text even when the bank provides the merchant name", () => {
    const label = getOverrideCategoryLabel({
      merchantName: "Advantage Savings",
      name: "Interest Earned",
    });
    expect(label).toBe("Interests");
  });
});
