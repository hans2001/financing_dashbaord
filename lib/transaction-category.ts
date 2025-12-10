import type { Transaction } from "@prisma/client";

export const DEFAULT_CATEGORY_LABEL = "Uncategorized";

type MerchantSource = {
  merchantName?: string | null;
  name?: string | null;
  category?: string[] | null;
  amount?: number;
};

const CATEGORY_OVERRIDE_RULES: Array<{
  keywords: string[];
  label: string;
}> = [
  { keywords: ["nu flywire"], label: "Tuition" },
  { keywords: ["uber eats"], label: "Food" },
  { keywords: ["atm", "withdrwl"], label: "Rent" },
  { keywords: ["siyuan gao"], label: "Internet" },
  { keywords: ["yuqing cui"], label: "Household" },
  { keywords: ["zelle payment from"], label: "Business" },
  { keywords: ["zelle payment to"], label: "Miscellaneous" },
  { keywords: ["uber"], label: "Transportation" },
  { keywords: ["mbta"], label: "Transportation" },
];

export const dropConfSuffix = (value?: string | null) => {
  if (!value) {
    return value;
  }
  const match = value.match(/^(.*?)(?:\s+Conf.*)?$/i);
  return match?.[1]?.trim() ?? value;
};

const normalizeForRules = (value?: string | null) =>
  value?.toLowerCase().trim() ?? "";

export const getOverrideCategoryLabel = (
  source: MerchantSource | Pick<Transaction, "name" | "merchantName">,
): string | null => {
  const text = dropConfSuffix(source.merchantName ?? source.name ?? "");
  const normalized = normalizeForRules(text);

  for (const rule of CATEGORY_OVERRIDE_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.label;
    }
  }

  return null;
};

export const getTransactionCategoryPath = (transaction: MerchantSource) => {
  const overrideLabel = getOverrideCategoryLabel(transaction);
  if (overrideLabel) {
    return overrideLabel;
  }

  const fallback = (transaction.category ?? []).filter(Boolean).join(" > ");
  return fallback || DEFAULT_CATEGORY_LABEL;
};
