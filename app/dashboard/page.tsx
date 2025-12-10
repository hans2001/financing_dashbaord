'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Account = {
  id: string;
  name: string;
  officialName?: string | null;
  mask?: string | null;
  type: string;
  subtype?: string | null;
  institutionName?: string | null;
};

type Transaction = {
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

type SummaryResponse = {
  totalSpent: number;
  totalIncome: number;
  largestExpense: number;
  largestIncome: number;
  spendCount: number;
  incomeCount: number;
  categoryTotals: Record<string, number>;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const CATEGORY_BADGES: Record<
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

const DEFAULT_CATEGORY = "uncategorized";

const formatTransactionAmount = (amount: number) => formatCurrency(amount);

const getCategoryBadge = (categoryPath?: string) => {
  const baseCategory =
    categoryPath?.split(" > ")[0]?.trim().toLowerCase() ??
    DEFAULT_CATEGORY;
  return CATEGORY_BADGES[baseCategory] ?? CATEGORY_BADGES[DEFAULT_CATEGORY];
};

const formatIsoDate = (date: Date) => date.toISOString().split("T")[0];

const computeDefaultDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    start: formatIsoDate(startOfMonth),
    end: formatIsoDate(now),
  };
};
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const SORT_OPTIONS = [
  { value: "date_desc", label: "Date (newest first)" },
  { value: "date_asc", label: "Date (oldest first)" },
  { value: "amount_desc", label: "Amount (high → low)" },
  { value: "amount_asc", label: "Amount (low → high)" },
  { value: "merchant_asc", label: "Merchant (A → Z)" },
  { value: "merchant_desc", label: "Merchant (Z → A)" },
];
const FLOW_FILTERS = [
  { value: "all", label: "All activity" },
  { value: "spending", label: "Spending only" },
  { value: "inflow", label: "Income only" },
];
const CATEGORY_PIE_COLORS = [
  "#0f5ef2",
  "#7c3aed",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#14b8a6",
];
const MAX_CATEGORY_SLICES = 5;
const FAMILY_AUTH_HEADER = "x-family-secret";
const FAMILY_AUTH_SECRET =
  process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN ??
  "family-dashboard-secret";
const FAMILY_AUTH_HEADERS = {
  [FAMILY_AUTH_HEADER]: FAMILY_AUTH_SECRET,
};

const truncateInline = (value: string, maxLength = 70) => {
  if (!value) {
    return value;
  }
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<string>
  >(new Set());
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showAccountsPanel, setShowAccountsPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(
    null,
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value);
  const [flowFilter, setFlowFilter] = useState(FLOW_FILTERS[0].value);
  const handleDescriptionSaved = useCallback((transactionId: string, description: string | null) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, description: description ?? null }
          : transaction,
      ),
    );
  }, []);

  useEffect(() => {
    setDateRange((current) => {
      if (current.start && current.end) {
        return current;
      }
      return computeDefaultDateRange();
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    setIsLoadingAccounts(true);
    setAccountsError(null);

    (async () => {
      try {
        const response = await fetch("/api/accounts", {
          headers: FAMILY_AUTH_HEADERS,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load accounts");
        }
        if (!ignore) {
          setAccounts(payload.accounts ?? []);
        }
      } catch (error) {
        if (!ignore) {
          setAccountsError(
            error instanceof Error ? error.message : "Failed to fetch accounts",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingAccounts(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      return;
    }
    let ignore = false;
    setIsLoadingTransactions(true);
    setTransactionsError(null);

    (async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", pageSize.toString());
        if (selectedAccount !== "all") {
          params.set("accountId", selectedAccount);
        }
        params.set("startDate", dateRange.start);
        params.set("endDate", dateRange.end);
        params.set("offset", (currentPage * pageSize).toString());
        params.set("sort", sortOption);
        params.set("flow", flowFilter);

        const response = await fetch(`/api/transactions?${params.toString()}`, {
          headers: FAMILY_AUTH_HEADERS,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load transactions");
        }
        if (!ignore) {
          setTransactions(payload.transactions ?? []);
          setTotalTransactions(payload.total ?? 0);
          setSelectedTransactionIds((prev) => {
            const next = new Set<string>();
            for (const tx of payload.transactions ?? []) {
              if (prev.has(tx.id)) {
                next.add(tx.id);
              }
            }
            return next;
          });
        }
      } catch (error) {
        if (!ignore) {
          setTransactionsError(
            error instanceof Error
              ? error.message
              : "Failed to fetch transactions",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingTransactions(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    selectedAccount,
    dateRange.start,
    dateRange.end,
    refreshKey,
    currentPage,
    pageSize,
    sortOption,
    flowFilter,
  ]);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      return;
    }
    let ignore = false;
    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummaryData(null);

    (async () => {
      try {
        const params = new URLSearchParams();
        if (selectedAccount !== "all") {
          params.set("accountId", selectedAccount);
        }
        params.set("startDate", dateRange.start);
        params.set("endDate", dateRange.end);

        const response = await fetch(
          `/api/transactions/summary?${params.toString()}`,
          {
            headers: FAMILY_AUTH_HEADERS,
          },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load summary");
        }
        if (!ignore) {
          setSummaryData(payload);
        }
      } catch (error) {
        if (!ignore) {
          setSummaryError(
            error instanceof Error
              ? error.message
              : "Failed to fetch spending summary",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingSummary(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    selectedAccount,
    dateRange.start,
    dateRange.end,
    refreshKey,
  ]);

  useEffect(() => {
    setCurrentPage(0);
    setSelectedTransactionIds(new Set());
  }, [
    selectedAccount,
    dateRange.start,
    dateRange.end,
    pageSize,
    sortOption,
    flowFilter,
  ]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/transactions/sync", {
        method: "POST",
        headers: {
          ...FAMILY_AUTH_HEADERS,
          "Content-Type": "application/json",
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Sync failed");
      }
      setSyncMessage(
        `Fetched ${payload.fetched ?? 0}, inserted ${payload.inserted ?? 0
        }, updated ${payload.updated ?? 0}`,
      );
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setSyncMessage(
        error instanceof Error ? error.message : "Unable to sync transactions",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const totalPages =
    totalTransactions === 0
      ? 1
      : Math.ceil(totalTransactions / pageSize);
  const showingStart =
    totalTransactions === 0 ? 0 : currentPage * pageSize + 1;
  const showingEnd = Math.min(
    totalTransactions,
    (currentPage + 1) * pageSize,
  );
  const hasSelection = selectedTransactionIds.size > 0;
  const selection = useMemo(() => {
    if (selectedTransactionIds.size === 0) {
      return transactions;
    }
    return transactions.filter((tx) => selectedTransactionIds.has(tx.id));
  }, [selectedTransactionIds, transactions]);
  const selectionSpending = useMemo(
    () => selection.filter((tx) => tx.amount < 0),
    [selection],
  );
  const selectionIncome = useMemo(
    () => selection.filter((tx) => tx.amount > 0),
    [selection],
  );
  const selectionSpentTotal = useMemo(
    () =>
      selectionSpending.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    [selectionSpending],
  );
  const selectionIncomeTotal = useMemo(
    () => selectionIncome.reduce((sum, tx) => sum + tx.amount, 0),
    [selectionIncome],
  );
  const selectedLargestExpense = useMemo(() => {
    if (selectionSpending.length === 0) return 0;
    return Math.max(...selectionSpending.map((tx) => Math.abs(tx.amount)));
  }, [selectionSpending]);
  const selectedLargestIncome = useMemo(() => {
    if (selectionIncome.length === 0) return 0;
    return Math.max(...selectionIncome.map((tx) => tx.amount));
  }, [selectionIncome]);
  const selectionSpendCount = selectionSpending.length;
  const selectionIncomeCount = selectionIncome.length;
  const summarySpentTotal = summaryData?.totalSpent ?? 0;
  const summaryIncomeTotal = summaryData?.totalIncome ?? 0;
  const summaryLargestExpense = summaryData?.largestExpense ?? 0;
  const summaryLargestIncome = summaryData?.largestIncome ?? 0;
  const summarySpendCount = summaryData?.spendCount ?? 0;
  const summaryIncomeCount = summaryData?.incomeCount ?? 0;
  const activeSpentTotal = hasSelection ? selectionSpentTotal : summarySpentTotal;
  const activeIncomeTotal = hasSelection ? selectionIncomeTotal : summaryIncomeTotal;
  const activeLargestExpense = hasSelection
    ? selectedLargestExpense
    : summaryLargestExpense;
  const activeLargestIncome = hasSelection
    ? selectedLargestIncome
    : summaryLargestIncome;
  const activeSpendCount = hasSelection ? selectionSpendCount : summarySpendCount;
  const activeIncomeCount = hasSelection ? selectionIncomeCount : summaryIncomeCount;
  const selectionCategoryTotals = useMemo(() => {
    return selectionSpending.reduce<Record<string, number>>((collector, tx) => {
      const label = tx.categoryPath ?? "Uncategorized";
      collector[label] = (collector[label] ?? 0) + Math.abs(tx.amount);
      return collector;
    }, {});
  }, [selectionSpending]);
  const selectionTopCategories = useMemo(() => {
    return Object.entries(selectionCategoryTotals).sort((a, b) => b[1] - a[1]);
  }, [selectionCategoryTotals]);
  const summaryCategoryEntries = useMemo(() => {
    if (!summaryData) {
      return [];
    }
    return Object.entries(summaryData.categoryTotals).sort((a, b) => b[1] - a[1]);
  }, [summaryData]);
  const summaryTopCategories = summaryCategoryEntries;
  const categoriesToShow = hasSelection
    ? selectionTopCategories
    : summaryTopCategories;
  const pieCategories = useMemo(() => {
    const base = categoriesToShow.slice(0, MAX_CATEGORY_SLICES);
    if (categoriesToShow.length > MAX_CATEGORY_SLICES) {
      const remainderTotal = categoriesToShow
        .slice(MAX_CATEGORY_SLICES)
        .reduce((sum, [, value]) => sum + value, 0);
      if (remainderTotal > 0) {
        return [...base, ["Other", remainderTotal] as [string, number]];
      }
    }
    return base;
  }, [categoriesToShow]);
  const pieTotal = pieCategories.reduce((sum, [, value]) => sum + value, 0);
  const pieSegments = useMemo(() => {
    if (pieCategories.length === 0) {
      return [];
    }
    const total = pieTotal || 1;
    let offset = 0;
    return pieCategories.map(([label, value], index) => {
      const percent = value / total;
      const start = offset;
      const end = start + percent * 100;
      offset = end;
      return {
        label,
        value,
        percent,
        start,
        end,
        color: CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length],
      };
    });
  }, [pieCategories, pieTotal]);
  const pieGradient = useMemo(() => {
    if (pieSegments.length === 0) {
      return "var(--color-slate-200) 0% 100%";
    }
    return pieSegments
      .map(
        (segment) =>
          `${segment.color} ${segment.start}% ${segment.end}%`,
      )
      .join(", ");
  }, [pieSegments]);
  const summaryRowsLabel = hasSelection
    ? `${selection.length} selected rows`
    : isLoadingSummary
      ? "Loading summary…"
      : "All rows in this range";
  const summaryErrorText = !hasSelection ? summaryError : null;
  const categoryEmptyMessage = hasSelection
    ? "No spending data in selected rows yet."
    : isLoadingSummary
      ? "Loading categories…"
      : "No spending data in this range yet.";
  const isAllVisibleSelected =
    transactions.length > 0 &&
    transactions.every((tx) => selectedTransactionIds.has(tx.id));

  const toggleSelectRow = (id: string) => {
    setSelectedTransactionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectPage = () => {
    setSelectedTransactionIds((prev) => {
      if (isAllVisibleSelected) {
        const next = new Set(prev);
        transactions.forEach((tx) => next.delete(tx.id));
        return next;
      }
      const next = new Set(prev);
      transactions.forEach((tx) => next.add(tx.id));
      return next;
    });
  };

  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <section className="flex flex-col  rounded-3xl border border-slate-200 bg-white px-4 py-2 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Accounts & spending
            </h1>
          </div>
          <div className="flex w-full justify-end sm:w-auto">
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                className="inline-flex min-w-[13rem] items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync latest transactions"}
              </button>
              <p className="text-[0.65rem] text-slate-500">
                {syncMessage ?? "Last synced when this page loaded."}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-[0.85] flex-col gap-4">
            <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Transactions
                </h2>
                <div className="grid w-full gap-3 text-[0.55rem] uppercase tracking-[0.3em] text-slate-500 sm:grid-cols-2 lg:grid-cols-6">
                  <label className="flex flex-col gap-1">
                    Account
                    <select
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={selectedAccount}
                      onChange={(event) =>
                        setSelectedAccount(event.target.value)
                      }
                    >
                      <option value="all">All accounts</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    From
                    <input
                      type="date"
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={dateRange.start}
                      onChange={(event) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    To
                    <input
                      type="date"
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={dateRange.end}
                      onChange={(event) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Rows
                    <select
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option value={size} key={size}>
                          {size} / page
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Flow
                    <select
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={flowFilter}
                      onChange={(event) => setFlowFilter(event.target.value)}
                    >
                      {FLOW_FILTERS.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Sort
                    <select
                      className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
                      value={sortOption}
                      onChange={(event) => setSortOption(event.target.value)}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex-1 overflow-x-auto">
                {isLoadingTransactions ? (
                  <p className="text-sm text-slate-500">
                    Loading transactions...
                  </p>
                ) : transactionsError ? (
                  <p className="text-sm text-red-600">{transactionsError}</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No transactions were found for this range.
                  </p>
                ) : (
                  <table className="min-w-full table-fixed text-left text-xs">
                    <colgroup>
                      <col style={{ width: "1.5rem" }} />
                      <col style={{ width: "5rem" }} />
                      <col style={{ width: "2rem" }} />
                      <col style={{ width: "6rem" }} />
                      <col style={{ width: "6rem" }} />
                      <col style={{ width: "2rem" }} />
                      <col />
                      <col style={{ width: "2rem" }} />
                    </colgroup>
                    <thead className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-500">
                      <tr>
                        <th className="py-1.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                            checked={isAllVisibleSelected}
                            onChange={toggleSelectPage}
                          />
                        </th>
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5">Status</th>
                        <th className="py-1.5">Account</th>
                        <th className="py-1.5">Merchant / Name</th>
                        <th className="py-1.5">Category</th>
                        <th className="py-1.5 pr-4">Description</th>
                        <th className="py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {transactions.map((tx) => {
                        const categoryBadge = getCategoryBadge(tx.categoryPath);
                        return (
                          <tr
                            key={tx.id}
                            className="border-b border-slate-100 text-xs last:border-none"
                          >
                            <td>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                                checked={selectedTransactionIds.has(tx.id)}
                                onChange={() => toggleSelectRow(tx.id)}
                              />
                            </td>
                            <td className="text-[0.75rem] text-slate-500">
                              <div>{tx.date}</div>
                              {tx.time && (
                                <p className="text-[0.65rem] text-slate-400">
                                  {tx.time}
                                </p>
                              )}
                            </td>
                            <td className="min-w-[4rem]">
                              <span
                                className={
                                  tx.pending
                                    ? "rounded-full bg-amber-100 px-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-amber-700"
                                    : "rounded-full bg-emerald-100 px-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-emerald-700"
                                }
                              >
                                {tx.pending ? "Pending" : "Posted"}
                              </span>
                            </td>
                            <td className="min-w-[6rem]">{tx.accountName}</td>
                            <td className="w-[18rem] max-w-[18rem]">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="text-xs font-medium text-slate-900"
                                  title={tx.merchantName ?? tx.name}
                                >
                                  {truncateInline(tx.merchantName ?? tx.name)}
                                </span>
                              </div>
                              {(tx.location?.city ||
                                tx.paymentMeta?.payment_channel) && (
                                  <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
                                    {[tx.location?.city, tx.location?.region]
                                      .filter(Boolean)
                                      .join(", ")}
                                    {tx.paymentMeta?.payment_channel
                                      ? ` • ${tx.paymentMeta.payment_channel}`
                                      : ""}
                                  </p>
                                )}
                            </td>
                            <td className="text-[0.75rem]">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
                              >
                                {categoryBadge.label}
                              </span>
                            </td>
                            <td className="w-[12rem] text-[0.75rem] text-slate-500">
                              <div className="flex w-full max-w-full items-center overflow-x-auto whitespace-nowrap">
                                <DescriptionEditor
                                  transactionId={tx.id}
                                  value={tx.description ?? ""}
                                  onSaved={(next) => handleDescriptionSaved(tx.id, next)}
                                />
                              </div>
                            </td>
                            <td className="text-right text-sm font-medium">
                              <span
                                className={
                                  tx.amount < 0
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                }
                              >
                                {formatTransactionAmount(tx.amount)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {totalTransactions === 0
                    ? "No transactions to display."
                    : `Showing ${showingStart}-${showingEnd} of ${totalTransactions}`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
                    onClick={() => {
                      setSelectedTransactionIds(new Set());
                    }}
                    disabled={!hasSelection}
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
                    onClick={() =>
                      setCurrentPage((page) =>
                        (page + 1) * pageSize >= totalTransactions
                          ? page
                          : page + 1,
                      )
                    }
                    disabled={(currentPage + 1) * pageSize >= totalTransactions}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-6 flex max-h-[calc(100vh-200px)] min-w-0 flex-[0.15] flex-col gap-3 xl:min-w-[280px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
              <div className="pb-2">
                <p className="text-[0.5rem] uppercase tracking-[0.3em] text-slate-400">
                  Spending summary
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(activeSpentTotal)}
                </p>
                <p className="text-xs text-slate-500">{summaryRowsLabel}</p>
                {summaryErrorText && (
                  <p className="text-[0.6rem] text-red-600">
                    {summaryErrorText}
                  </p>
                )}
                <p className="text-[0.6rem] text-slate-400">
                  {dateRange.start || "—"} → {dateRange.end || "—"}
                </p>
              </div>
              <dl className="divide-y divide-slate-100 text-[0.75rem] text-slate-600">
                {[
                  {
                    label: "Net cashflow",
                    value: activeIncomeTotal - activeSpentTotal,
                    tone: "text-slate-900",
                  },
                  {
                    label: "Total inflow",
                    value: activeIncomeTotal,
                    tone: "text-emerald-600",
                  },
                  {
                    label: "Total spent",
                    value: activeSpentTotal,
                    tone: "text-red-600",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1">
                    <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
                      {row.label}
                    </dt>
                    <dd className={`font-semibold ${row.tone}`}>
                      {formatCurrency(row.value)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1">
                  <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
                    Transactions
                  </dt>
                  <dd className="text-[0.7rem] font-semibold text-slate-900">
                    {activeSpendCount} spend · {activeIncomeCount} inflow
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
                    Largest expense
                  </dt>
                  <dd className="text-[0.7rem] font-semibold text-red-600">
                    {activeLargestExpense > 0
                      ? formatCurrency(-activeLargestExpense)
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
                    Largest inflow
                  </dt>
                  <dd className="text-[0.7rem] font-semibold text-emerald-600">
                    {activeLargestIncome > 0
                      ? formatCurrency(activeLargestIncome)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
                Top categories
              </p>
              {categoriesToShow.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  {categoryEmptyMessage}
                </p>
              ) : (
                <div className="mt-3 flex flex-col items-center gap-3 text-center">
                  <div className="relative h-36 w-36">
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        backgroundImage: `conic-gradient(${pieGradient})`,
                      }}
                    />
                    <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center">
                      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-slate-400">
                        Total
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(pieTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-sm text-slate-600 md:flex-row md:flex-wrap md:items-center md:gap-3">
                    {pieSegments.map((segment) => (
                      <div
                        key={segment.label}
                        className="flex w-full max-w-sm items-center justify-between gap-2 md:w-auto md:flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="text-slate-900">
                            {segment.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {Math.round(segment.percent * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
                    Linked accounts
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {accounts.length} connected
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 underline-offset-2 hover:text-slate-800"
                  onClick={() => setShowAccountsPanel((prev) => !prev)}
                >
                  {showAccountsPanel ? "Less" : "Details"}
                </button>
              </div>
              {isLoadingAccounts ? (
                <p className="mt-4 text-sm text-slate-500">
                  Loading linked accounts…
                </p>
              ) : accountsError ? (
                <p className="mt-4 text-sm text-red-600">{accountsError}</p>
              ) : (
                <div className="mt-2 flex-1 overflow-y-auto pr-1 text-[0.85rem] text-slate-700">
                  {(showAccountsPanel ? accounts : accounts.slice(0, 4)).map(
                    (account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between border-b border-slate-100 py-1 text-sm last:border-none"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {account.name}
                          </p>
                          <p className="text-[0.6rem] text-slate-500">
                            {account.institutionName ?? "Plaid"}
                          </p>
                        </div>
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">
                          {account.type}
                        </p>
                      </div>
                    ),
                  )}
                  {accounts.length > 4 && !showAccountsPanel && (
                    <p className="pt-2 text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
                      +{accounts.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type DescriptionEditorProps = {
  transactionId: string;
  value: string;
  onSaved: (description: string | null) => void;
};

type DescriptionFormValues = {
  description: string;
};

function DescriptionEditor({
  transactionId,
  value,
  onSaved,
}: DescriptionEditorProps) {
  const { register, handleSubmit, reset } =
    useForm<DescriptionFormValues>({
      defaultValues: { description: value ?? "" },
    });
  const [status, setStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    reset({ description: value ?? "" }, { keepDirty: false });
  }, [reset, value]);

  const onSubmit = handleSubmit(async (data) => {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/description`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...FAMILY_AUTH_HEADERS,
          },
          body: JSON.stringify({ description: data.description }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        transaction?: { description?: string | null };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to update description");
      }
      const nextDescription = payload.transaction?.description ?? null;
      onSaved(nextDescription);
      reset({ description: nextDescription ?? "" }, { keepDirty: false });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
      setIsEditing(false);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update description",
      );
    }
  });

  const readOnlyView = (
    <button
      type="button"
      className="group flex min-h-[1.75rem] w-full items-center rounded border border-transparent px-2 text-left text-xs text-slate-700 transition hover:border-slate-200 hover:bg-white focus:outline-none"
      onClick={() => {
        setIsEditing(true);
        setStatus("idle");
        setErrorMessage(null);
      }}
    >
      {value?.trim() ? (
        <span className="block w-full truncate" title={value}>
          {truncateInline(value)}
        </span>
      ) : (
        <span className="block w-full truncate italic text-slate-400">
          Add description
        </span>
      )}
    </button>
  );

  const editView = (
    <form onSubmit={onSubmit} className="flex w-full flex-col">
      <input
        {...register("description")}
        className="min-h-[1.75rem] w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
        placeholder="Add notes"
        maxLength={300}
        disabled={status === "saving"}
        autoFocus
        style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        onBlur={() => {
          if (status === "saving") {
            return;
          }
          reset({ description: value ?? "" }, { keepDirty: false });
          setIsEditing(false);
          setStatus("idle");
          setErrorMessage(null);
        }}
      />
    </form>
  );

  return (
    <div className="flex w-full flex-col">
      {isEditing ? editView : readOnlyView}
      <div className="h-0 text-[0.6rem]">
        {isEditing &&
          (errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : status === "success" ? (
            <p className="text-emerald-600">Saved</p>
          ) : null)}
      </div>
    </div>
  );
}
