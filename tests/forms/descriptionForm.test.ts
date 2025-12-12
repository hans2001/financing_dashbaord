import { describe, expect, it } from "vitest";

import {
  DESCRIPTION_MAX_LENGTH,
  descriptionValueSchema,
} from "@/components/dashboard/forms/descriptionForm";

describe("descriptionSchema", () => {
  it("trims whitespace before validation", () => {
    const parsed = descriptionValueSchema.parse("  expense notes  ");
    expect(parsed).toBe("expense notes");
  });

  it("rejects inputs longer than the configured limit", () => {
    const longValue = "a".repeat(DESCRIPTION_MAX_LENGTH + 1);
    expect(() => descriptionValueSchema.parse(longValue)).toThrow(
      `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`,
    );
  });
});
