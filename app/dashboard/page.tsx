'use client'

import { useEffect, useMemo, useState } from "react";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatIsoDate = (date: Date) => date.toISOString().split("T")[0];

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const PAGE_SIZE_OPTIONS = [25, 50, 100];

type SummaryPeriod = "day" | "week" | "month" | "year";

const countPeriods = (start: Date, end: Date, period: SummaryPeriod) => {
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return 1;
  }
  const diffDays =
    Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  switch (period) {
    case "day":
      return Math.max(diffDays, 1);
    case "week":
      return Math.max(Math.ceil(diffDays / 7), 1);
    case "month": {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        1;
      return Math.max(months, 1);
    }
    case "year":
      return Math.max(end.getFullYear() - start.getFullYear() + 1, 1);
    default:
      return 1;
  }
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
  const [dateRange, setDateRange] = useState({
    start: formatIsoDate(firstDayOfMonth),
    end: formatIsoDate(today),
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showAccountsPanel, setShowAccountsPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    let ignore = false;
    setIsLoadingAccounts(true);
    setAccountsError(null);

    (async () => {
      try {
        const response = await fetch("/api/accounts");
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

        const response = await fetch(`/api/transactions?${params.toString()}`);
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
  ]);

  useEffect(() => {
    setCurrentPage(0);
    setSelectedTransactionIds(new Set());
  }, [selectedAccount, dateRange.start, dateRange.end, pageSize]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/transactions/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Sync failed");
      }
      setSyncMessage(
        `Fetched ${payload.fetched ?? 0}, inserted ${
          payload.inserted ?? 0
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

  const spendingTransactions = useMemo(
    () => transactions.filter((tx) => tx.amount < 0),
    [transactions],
  );

  const totalSpent = useMemo(
    () =>
      spendingTransactions.reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0,
      ),
    [spendingTransactions],
  );

  const categoryTotals = useMemo(() => {
    return spendingTransactions.reduce<Record<string, number>>(
      (collector, tx) => {
        const label = tx.category?.[0] ?? "Uncategorized";
        collector[label] = (collector[label] ?? 0) + Math.abs(tx.amount);
        return collector;
      },
      {},
    );
  }, [spendingTransactions]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  }, [categoryTotals]);

  const topCategories = sortedCategories.slice(0, 3);
  const maxCategoryValue = (topCategories[0]?.[1] ?? totalSpent) || 1;

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
  const startDateObj = useMemo(
    () => new Date(dateRange.start),
    [dateRange.start],
  );
  const endDateObj = useMemo(
    () => new Date(dateRange.end),
    [dateRange.end],
  );
  const periodCounts = useMemo(() => {
    return {
      day: countPeriods(startDateObj, endDateObj, "day"),
      week: countPeriods(startDateObj, endDateObj, "week"),
      month: countPeriods(startDateObj, endDateObj, "month"),
      year: countPeriods(startDateObj, endDateObj, "year"),
    };
  }, [startDateObj, endDateObj]);
  const spendingPerPeriod = {
    day:
      periodCounts.day > 0 ? selectionSpentTotal / periodCounts.day : 0,
    week:
      periodCounts.week > 0 ? selectionSpentTotal / periodCounts.week : 0,
    month:
      periodCounts.month > 0
        ? selectionSpentTotal / periodCounts.month
        : 0,
    year:
      periodCounts.year > 0 ? selectionSpentTotal / periodCounts.year : 0,
  };
  const incomePerPeriod = {
    day:
      periodCounts.day > 0 ? selectionIncomeTotal / periodCounts.day : 0,
    week:
      periodCounts.week > 0 ? selectionIncomeTotal / periodCounts.week : 0,
    month:
      periodCounts.month > 0
        ? selectionIncomeTotal / periodCounts.month
        : 0,
    year:
      periodCounts.year > 0 ? selectionIncomeTotal / periodCounts.year : 0,
  };
  const largestExpense = useMemo(() => {
    if (selectionSpending.length === 0) return 0;
    return Math.max(
      ...selectionSpending.map((tx) => Math.abs(tx.amount)),
    );
  }, [selectionSpending]);
  const largestIncome = useMemo(() => {
    if (selectionIncome.length === 0) return 0;
    return Math.max(...selectionIncome.map((tx) => tx.amount));
  }, [selectionIncome]);
  const spendCount = selectionSpending.length;
  const incomeCount = selectionIncome.length;

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
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <section className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Accounts & spending
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing..." : "Sync latest transactions"}
            </button>
            {syncMessage && (
              <p className="text-xs text-slate-500">{syncMessage}</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-[0.85] flex-col gap-4">
            <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Transactions
                  </h2>
                </div>
                <div className="grid w-full gap-3 text-[0.55rem] uppercase tracking-[0.3em] text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="flex flex-col gap-1">
                    Account
                    <select
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
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
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
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
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
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
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
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
                  <table className="min-w-full text-left text-xs">
                    <thead className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-500">
                      <tr>
                        <th className="w-8 py-1.5">
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
                        <th className="py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-slate-100 text-xs last:border-none"
                        >
                          <td className="py-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                              checked={selectedTransactionIds.has(tx.id)}
                              onChange={() => toggleSelectRow(tx.id)}
                            />
                          </td>
                          <td className="py-2 text-[0.75rem] text-slate-500">
                            <div>{tx.date}</div>
                            {tx.time && (
                              <p className="text-[0.65rem] text-slate-400">
                                {tx.time}
                              </p>
                            )}
                          </td>
                          <td className="py-2">
                            <span
                              className={
                                tx.pending
                                  ? "rounded-full bg-amber-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-amber-700"
                                  : "rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-emerald-700"
                              }
                            >
                              {tx.pending ? "Pending" : "Posted"}
                            </span>
                          </td>
                          <td className="py-2">{tx.accountName}</td>
                          <td className="py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">
                                {tx.merchantName ?? tx.name}
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
                          <td className="py-2 text-[0.75rem] text-slate-500">
                            {tx.categoryPath ?? "Uncategorized"}
                          </td>
                          <td className="py-2 text-right text-sm font-medium">
                            <span
                              className={
                                tx.amount < 0
                                  ? "text-red-600"
                                  : "text-emerald-600"
                              }
                            >
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
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

          <div className="sticky top-6 flex max-h-[calc(100vh-200px)] min-w-0 flex-[0.15] flex-col gap-4 xl:min-w-[320px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <div className="pb-3">
                <p className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-400">
                  Spending summary
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(selectionSpentTotal)}
                </p>
                <p className="text-[0.75rem] text-slate-500">
                  {hasSelection ? `${selection.length} selected rows` : "All rows on this page"}
                </p>
                <p className="text-[0.7rem] text-slate-400">
                  {dateRange.start} → {dateRange.end}
                </p>
              </div>
              <dl className="divide-y divide-slate-100 text-[0.8rem] text-slate-600">
                {[
                  {
                    label: "Net cashflow",
                    value: selectionIncomeTotal - selectionSpentTotal,
                    tone: "text-slate-900",
                  },
                  {
                    label: "Total inflow",
                    value: selectionIncomeTotal,
                    tone: "text-emerald-600",
                  },
                  {
                    label: "Total spent",
                    value: selectionSpentTotal,
                    tone: "text-red-600",
                  },
                  {
                    label: "Largest expense",
                    value: largestExpense,
                    tone: "text-red-600",
                  },
                  {
                    label: "Largest inflow",
                    value: largestIncome,
                    tone: "text-emerald-600",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5">
                    <dt className="text-[0.65rem] uppercase tracking-[0.3em]">
                      {row.label}
                    </dt>
                    <dd className={`font-semibold ${row.tone}`}>
                      {formatCurrency(row.value)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1.5">
                  <dt className="text-[0.65rem] uppercase tracking-[0.3em]">
                    Transactions
                  </dt>
                  <dd className="font-semibold text-slate-900">
                    {spendCount} spend · {incomeCount} inflow
                  </dd>
                </div>
              </dl>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">
                  Average spend / inflow
                </p>
                <div className="mt-2 grid gap-1 text-[0.75rem]">
                  {(["day", "week", "month", "year"] as SummaryPeriod[]).map(
                    (period) => (
                      <div
                        key={period}
                        className="flex items-center justify-between text-slate-600"
                      >
                        <span className="capitalize">{period}</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(
                            isFinite(spendingPerPeriod[period])
                              ? spendingPerPeriod[period]
                              : 0,
                          )}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(
                            isFinite(incomePerPeriod[period])
                              ? incomePerPeriod[period]
                              : 0,
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
                Top categories
              </p>
              <div className="mt-4 space-y-4">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No spending data in this range yet.
                  </p>
                ) : (
                  topCategories.map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-800">{label}</span>
                        <span className="text-slate-500">
                          {formatCurrency(value)}
                        </span>
                      </div>
                      <div className="mt-2 h-[6px] rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{
                            width: `${(value / maxCategoryValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
                    Linked accounts
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {accounts.length} connected
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                  onClick={() => setShowAccountsPanel((prev) => !prev)}
                >
                  {showAccountsPanel ? "Hide" : "Show"}
                </button>
              </div>
              {isLoadingAccounts ? (
                <p className="mt-4 text-sm text-slate-500">
                  Loading linked accounts…
                </p>
              ) : accountsError ? (
                <p className="mt-4 text-sm text-red-600">{accountsError}</p>
              ) : showAccountsPanel ? (
                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {accounts.map((account) => (
                    <article
                      key={account.id}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                          {account.institutionName ?? "Plaid"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {account.type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {account.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {account.officialName ?? account.name}
                      </p>
                      {account.mask && (
                        <p className="mt-1 text-xs text-slate-500">
                          •••• {account.mask}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Linked accounts are paused by default. Click “Show” to review
                  the list.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
