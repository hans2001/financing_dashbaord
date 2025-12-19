import type { Prisma } from "@prisma/client";

export const decimalToNumber = (value?: Prisma.Decimal | null) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
};
