export type DecimalLike = { toNumber?: () => number } | number;

export const decimalToNumber = (value?: DecimalLike | null) => {
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
