export type Account = {
  id: string;
  name: string;
  officialName?: string | null;
  mask?: string | null;
  type: string;
  subtype?: string | null;
  institutionName?: string | null;
  currentBalance?: number | null;
  availableBalance?: number | null;
  creditLimit?: number | null;
  balanceLastUpdated?: string | null;
  isBalanceStale?: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  time?: string | null;
  accountName: string;
  amount: number;
  description?: string | null;
  merchantName?: string | null;
  name: string;
  category: string[];
  categoryPath?: string;
  pending: boolean;
  status: "pending" | "posted";
  isoCurrencyCode: string;
  location?: {
    city?: string | null;
    region?: string | null;
  };
  paymentMeta?: {
    payment_channel?: string | null;
  };
};

export type SummaryResponse = {
  totalSpent: number;
  totalIncome: number;
  largestExpense: number;
  largestIncome: number;
  spendCount: number;
  incomeCount: number;
  categoryTotals: Record<string, number>;
  incomeCategoryTotals: Record<string, number>;
};
