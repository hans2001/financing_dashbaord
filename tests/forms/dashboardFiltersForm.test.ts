import { describe, expect, it } from "vitest";

import { dashboardFiltersResolver } from "@/components/dashboard/forms/dashboardFiltersForm";

const baseValues = {
  start: "2024-01-01",
  end: "2024-01-31",
  pageSize: "25",
  sortOption: "date_desc",
};

describe("dashboardFiltersResolver", () => {
  it("returns an error when the end date comes before the start date", async () => {
    const result = await dashboardFiltersResolver(
      { ...baseValues, start: "2024-02-02", end: "2024-02-01" },
      undefined,
      { shouldUseNativeValidation: false },
    );

    expect(result.errors.end?.message).toBe(
      "Start date must be before or equal to end date",
    );
    expect(result.values).toEqual({});
  });

  it("allows valid inputs and exposes normalized values", async () => {
    const result = await dashboardFiltersResolver(baseValues, undefined, {
      shouldUseNativeValidation: false,
    });

    expect(result.errors).toEqual({});
    expect(result.values).toEqual(baseValues);
  });
});
