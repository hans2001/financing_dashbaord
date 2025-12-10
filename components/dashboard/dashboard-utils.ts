export const FAMILY_AUTH_HEADER = "x-family-secret";
export const FAMILY_AUTH_SECRET =
  process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN ?? "family-dashboard-secret";
export const FAMILY_AUTH_HEADERS = {
  [FAMILY_AUTH_HEADER]: FAMILY_AUTH_SECRET,
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const CATEGORY_BADGES: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  tuition: {
    label: "Tuition",
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border border-rose-200",
  },
  transportation: {
    label: "Transportation",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border border-orange-200",
  },
  food: {
    label: "Food",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border border-amber-200",
  },
  rent: {
    label: "Rent",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border border-red-200",
  },
  internet: {
    label: "Internet",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border border-purple-200",
  },
  household: {
    label: "Household",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border border-indigo-200",
  },
  income: {
    label: "Income",
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border border-sky-200",
  },
  business: {
    label: "Business",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border border-emerald-200",
  },
  miscellaneous: {
    label: "Miscellaneous",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border border-cyan-200",
  },
  uncategorized: {
    label: "Uncategorized",
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border border-slate-200",
  },
};

export const DEFAULT_CATEGORY = "uncategorized";

export const getCategoryBadge = (categoryPath?: string) => {
  const baseCategory =
    categoryPath?.split(" > ")[0]?.trim().toLowerCase() ?? DEFAULT_CATEGORY;
  return CATEGORY_BADGES[baseCategory] ?? CATEGORY_BADGES[DEFAULT_CATEGORY];
};

export const truncateInline = (value: string, maxLength = 70) => {
  if (!value) {
    return value;
  }
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

export const formatIsoDate = (date: Date) => {
  const [isoDate] = date.toISOString().split("T");
  return isoDate ?? date.toISOString();
};

export const computeDefaultDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return {
    start: formatIsoDate(startOfMonth),
    end: formatIsoDate(now),
  };
};

export const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
  { value: 250, label: "250 / page" },
  { value: 500, label: "500 / page" },
  { value: 1000, label: "1000 / page" },
  { value: "all", label: "Show all results" },
] as const;
export type PageSizeOptionValue =
  (typeof PAGE_SIZE_OPTIONS)[number]["value"];
export const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (newest first)" },
  { value: "date_asc", label: "Date (oldest first)" },
  { value: "amount_desc", label: "Amount (high → low)" },
  { value: "amount_asc", label: "Amount (low → high)" },
  { value: "merchant_asc", label: "Merchant (A → Z)" },
  { value: "merchant_desc", label: "Merchant (Z → A)" },
];
export const FLOW_FILTERS = [
  { value: "all", label: "All activity" },
  { value: "spending", label: "Spending only" },
  { value: "inflow", label: "Income only" },
];

export const CATEGORY_PIE_COLORS = [
  "#0f5ef2",
  "#7c3aed",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#14b8a6",
];
export const MAX_CATEGORY_SLICES = 5;
