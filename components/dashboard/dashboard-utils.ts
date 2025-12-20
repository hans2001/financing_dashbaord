import type { Transaction } from "./types";

export const DATE_LOCALE = "en-US";

export const BALANCE_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const isBalanceStale = (balanceLastUpdated?: string | null) => {
  if (!balanceLastUpdated) {
    return true;
  }
  const timestamp = new Date(balanceLastUpdated).getTime();
  return Number.isNaN(timestamp)
    ? true
    : Date.now() - timestamp > BALANCE_STALE_THRESHOLD_MS;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatBalanceValue = (value?: number | null) =>
  typeof value === "number" ? formatCurrency(value) : "--";

export const formatBalanceTimestamp = (value?: string | null) => {
  if (!value) {
    return "No balance data yet";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No balance data yet";
  }
  return `Updated ${date.toLocaleDateString(DATE_LOCALE, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export type CategoryBadge = {
  label: string;
  bg: string;
  text: string;
  border: string;
  pieColor: string;
};

const CATEGORY_PALETTE: Record<string, CategoryBadge> = {
  tuition: {
    label: "Tuition",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border border-fuchsia-200",
    pieColor: "#c026d3",
  },
  transportation: {
    label: "Transportation",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border border-orange-200",
    pieColor: "#ea580c",
  },
  food: {
    label: "Food",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border border-amber-200",
    pieColor: "#d97706",
  },
  groceries: {
    label: "Groceries",
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border border-lime-200",
    pieColor: "#65a30d",
  },
  rent: {
    label: "Rent",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border border-red-200",
    pieColor: "#dc2626",
  },
  internet: {
    label: "Internet",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border border-purple-200",
    pieColor: "#7c3aed",
  },
  household: {
    label: "Household",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border border-indigo-200",
    pieColor: "#4f46e5",
  },
  interests: {
    label: "Interests",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border border-emerald-200",
    pieColor: "#15803d",
  },
  salary: {
    label: "Salary",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border border-pink-200",
    pieColor: "#be185d",
  },
  business: {
    label: "Business",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border border-teal-200",
    pieColor: "#0f766e",
  },
  health: {
    label: "Health",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border border-sky-200",
    pieColor: "#0284c7",
  },
  miscellaneous: {
    label: "Miscellaneous",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border border-cyan-200",
    pieColor: "#0ea5e9",
  },
  uncategorized: {
    label: "Uncategorized",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border border-slate-200",
    pieColor: "#94a3b8",
  },
};
export const CATEGORY_BADGES = CATEGORY_PALETTE;

export const DEFAULT_CATEGORY = "uncategorized";

const DEFAULT_CATEGORY_BADGE = (() => {
  const badge = CATEGORY_BADGES[DEFAULT_CATEGORY];
  if (!badge) {
    throw new Error(`Missing default badge for "${DEFAULT_CATEGORY}"`);
  }
  return badge;
})();

const normalizeCategoryKey = (value?: string) => {
  return (
    value?.split(" > ")[0]?.trim().toLowerCase() ?? DEFAULT_CATEGORY
  );
};

export const getCategoryBadge = (categoryPath?: string): CategoryBadge => {
  const baseCategory = normalizeCategoryKey(categoryPath);
  const badge = CATEGORY_BADGES[baseCategory];
  if (badge) {
    return badge;
  }
  return DEFAULT_CATEGORY_BADGE;
};

export const getCategoryPieColor = (categoryPath?: string) =>
  getCategoryBadge(categoryPath).pieColor;

export type StatusBadge = {
  label: string;
  bg: string;
  text: string;
  border: string;
};

type StatusKey = Transaction["status"];

const STATUS_BADGES: Record<StatusKey, StatusBadge> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border border-amber-200",
  },
  posted: {
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border border-emerald-200",
  },
};

const DEFAULT_STATUS: StatusKey = "posted";

export const getStatusBadge = (status: StatusKey) =>
  STATUS_BADGES[status] ?? STATUS_BADGES[DEFAULT_STATUS];

export const truncateInline = (value: string, maxLength = 45) => {
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
  { value: "all", label: "Show all results" },
] as const;
export type PageSizeOptionValue =
  (typeof PAGE_SIZE_OPTIONS)[number]["value"];
export const DEFAULT_NUMERIC_PAGE_SIZE =
  25 as Exclude<PageSizeOptionValue, "all">;
const FIRST_NUMERIC_PAGE_SIZE_VALUE =
  PAGE_SIZE_OPTIONS.find((option) => option.value !== "all")
    ?.value as
    | Exclude<PageSizeOptionValue, "all">
    | undefined;
export const DEFAULT_PAGE_SIZE_OPTION: PageSizeOptionValue =
  (FIRST_NUMERIC_PAGE_SIZE_VALUE ?? DEFAULT_NUMERIC_PAGE_SIZE) as PageSizeOptionValue;
export const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (newest first)" },
  { value: "date_asc", label: "Date (oldest first)" },
  { value: "amount_desc", label: "Amount (high → low)" },
  { value: "amount_asc", label: "Amount (low → high)" },
  { value: "merchant_asc", label: "Merchant (A → Z)" },
  { value: "merchant_desc", label: "Merchant (Z → A)" },
] as const;
export type SortOptionValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT_OPTION =
  (SORT_OPTIONS[0]?.value ?? "date_desc") as SortOptionValue;
export const FLOW_FILTERS = [
  { value: "all", label: "All activity" },
  { value: "spending", label: "Spending only" },
  { value: "inflow", label: "Income only" },
] as const;
export type FlowFilterValue = (typeof FLOW_FILTERS)[number]["value"];

export const DEFAULT_FLOW_FILTER = (
  FLOW_FILTERS[0]?.value ?? "all"
) as FlowFilterValue;

export const MAX_CATEGORY_SLICES = 5;
