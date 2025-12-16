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
  {
    keywords: [
      "customized cash",
      "cash rewards",
      "interest earned",
    ],
    label: "Interests",
  },
  { keywords: ["nu flywire", "nyu"], label: "Tuition" },
  { keywords: ["amazon", "whole foods", "aldi", "TJ Maxx"], label: "Groceries" },
  {
    keywords: [
      "uber eats",
      "bloomberg ce",
      "panera bread",
      "wok a holic",
      "bindaas",
      "domino's",
      "taco bell",
      "www.potbelly.il",
      "chipotle",
      "bb.qchick",
      "fresh baguette",
      "potbelly",
      "pizza h street",
      "khepra",
      "duangjai thai",
      "wasai",
      "delizique",
      "rice bar market place",
    ],
    label: "Food",
  },
  { keywords: ["WITHDRWL MBTA-MALDEN CENTER"], label: "Rent" },
  { keywords: ["siyuan gao", "comcast"], label: "Internet" },
  { keywords: ["yuqing cui"], label: "Household" },
  { keywords: ["payment from", "transfer from"], label: "Business" },
  { keywords: ["salary"], label: "Salary" },
  {
    keywords: ["transfer to", "payment to", "cashback", "rewards"],
    label: "Miscellaneous",
  },
  { keywords: ["cvs", "injury"], label: "Health" },
  {
    keywords: [
      "uber",
      "mbta",
      "metro",
      "delta air lines",
      "smartrip",
      "metro washington dcdc",
    ],
    label: "Transportation",
  },
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
  const text = dropConfSuffix(
    [source.merchantName, source.name].filter(Boolean).join(" ").trim(),
  );
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
