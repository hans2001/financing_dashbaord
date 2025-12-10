import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeDefaultDateRange,
  FAMILY_AUTH_HEADERS,
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "./dashboard-utils";
import type { PageSizeOptionValue } from "./dashboard-utils";
import type {
  Account,
  SummaryResponse,
  Transaction,
} from "./types";

type DashboardState = {
  accounts: Account[];
  isLoadingAccounts: boolean;
  accountsError: string | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;
  totalTransactions: number;
  selectedTransactionIds: Set<string>;
  selectedAccount: string;
  dateRange: { start: string; end: string };
  pageSize: PageSizeOptionValue;
  sortOption: string;
  flowFilter: string;
  currentPage: number;
  totalPages: number;
  showingStart: number;
  showingEnd: number;
  isShowingAllRows: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isAllVisibleSelected: boolean;
  hasSelection: boolean;
  categoriesToShow: [string, number][];
  categoryEmptyMessage: string;
  summaryRowsLabel: string;
  summaryErrorText: string | null;
  activeSpentTotal: number;
  activeIncomeTotal: number;
  activeSpendCount: number;
  activeIncomeCount: number;
  activeLargestExpense: number;
  activeLargestIncome: number;
  isSyncing: boolean;
  syncMessage: string | null;
  showAccountsPanel: boolean;
};

type DashboardActions = {
  handleDescriptionSaved: (transactionId: string, description: string | null) => void;
  toggleSelectRow: (id: string) => void;
  toggleSelectPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onClearSelection: () => void;
  setSelectedAccount: (value: string) => void;
  setDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  setPageSize: (value: PageSizeOptionValue) => void;
  setSortOption: (value: string) => void;
  setFlowFilter: (value: string) => void;
  handleSync: () => Promise<void>;
  setShowAccountsPanel: Dispatch<SetStateAction<boolean>>;
};

export function useDashboardState(): DashboardState & DashboardActions {
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
  const DEFAULT_NUMERIC_PAGE_SIZE = 25 as Exclude<PageSizeOptionValue, "all">;
  const numericDefaultPageSize =
    (PAGE_SIZE_OPTIONS.find(
      (option) => option.value !== "all",
    )?.value as Exclude<PageSizeOptionValue, "all"> | undefined) ??
    DEFAULT_NUMERIC_PAGE_SIZE;
  const defaultPageSizeOption: PageSizeOptionValue = PAGE_SIZE_OPTIONS.some(
    (option) => option.value === "all",
  )
    ? "all"
    : numericDefaultPageSize;
  const defaultSort = SORT_OPTIONS[0]?.value ?? "date_desc";
  const defaultFlowFilter = FLOW_FILTERS[0]?.value ?? "all";
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] =
    useState<PageSizeOptionValue>(defaultPageSizeOption);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>(defaultSort);
  const [flowFilter, setFlowFilter] = useState<string>(defaultFlowFilter);

  const handleDescriptionSaved = useCallback(
    (transactionId: string, description: string | null) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, description: description ?? null }
            : transaction,
        ),
      );
    },
    [],
  );

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
        if (pageSize === "all") {
          params.set("limit", "all");
          params.set("offset", "0");
        } else {
          params.set("limit", pageSize.toString());
          params.set("offset", (currentPage * pageSize).toString());
        }
        if (selectedAccount !== "all") {
          params.set("accountId", selectedAccount);
        }
        params.set("startDate", dateRange.start);
        params.set("endDate", dateRange.end);
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
        `Fetched ${payload.fetched ?? 0}, inserted ${payload.inserted ?? 0}, updated ${payload.updated ?? 0}`,
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

  const isShowingAllRows = pageSize === "all";
  const numericPageSize =
    typeof pageSize === "number" ? pageSize : numericDefaultPageSize;
  const totalPages =
    totalTransactions === 0 || isShowingAllRows
      ? 1
      : Math.ceil(totalTransactions / numericPageSize);
  const showingStart =
    totalTransactions === 0
      ? 0
      : isShowingAllRows
        ? 1
        : currentPage * numericPageSize + 1;
  const showingEnd =
    totalTransactions === 0
      ? 0
      : isShowingAllRows
        ? totalTransactions
        : Math.min(totalTransactions, (currentPage + 1) * numericPageSize);
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
    () => selectionSpending.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
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
  const categoriesToShow = hasSelection
    ? selectionTopCategories
    : summaryCategoryEntries;
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
  const hasPreviousPage = !isShowingAllRows && currentPage > 0;
  const hasNextPage =
    !isShowingAllRows &&
    (currentPage + 1) * numericPageSize < totalTransactions;

  const toggleSelectRow = useCallback(
    (id: string) => {
      setSelectedTransactionIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [],
  );

  const toggleSelectPage = useCallback(() => {
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
  }, [isAllVisibleSelected, transactions]);

  const onFirstPage = () => {
    if (isShowingAllRows) return;
    setCurrentPage(0);
  };
  const onPreviousPage = () => {
    if (isShowingAllRows) return;
    setCurrentPage((page) => Math.max(page - 1, 0));
  };
  const onNextPage = () => {
    if (isShowingAllRows) return;
    setCurrentPage((page) => (hasNextPage ? page + 1 : page));
  };
  const onLastPage = () => {
    if (isShowingAllRows) return;
    setCurrentPage(
      totalTransactions === 0 ? 0 : Math.max(totalPages - 1, 0),
    );
  };
  const onClearSelection = () => setSelectedTransactionIds(new Set());

  return {
    accounts,
    isLoadingAccounts,
    accountsError,
    transactions,
    isLoadingTransactions,
    transactionsError,
    totalTransactions,
    selectedTransactionIds,
    selectedAccount,
    dateRange,
    pageSize,
    sortOption,
    flowFilter,
    currentPage,
    totalPages,
    showingStart,
    showingEnd,
    isShowingAllRows,
    hasPreviousPage,
    hasNextPage,
    isAllVisibleSelected,
    hasSelection,
    categoriesToShow,
    categoryEmptyMessage,
    summaryRowsLabel,
    summaryErrorText,
    activeSpentTotal,
    activeIncomeTotal,
    activeSpendCount,
    activeIncomeCount,
    activeLargestExpense,
    activeLargestIncome,
    isSyncing,
    syncMessage,
    showAccountsPanel,
    handleDescriptionSaved,
    toggleSelectRow,
    toggleSelectPage,
    onPreviousPage,
    onFirstPage,
    onLastPage,
    onNextPage,
    onClearSelection,
    setSelectedAccount,
    setDateRange,
    setPageSize,
    setSortOption,
    setFlowFilter,
    handleSync,
    setShowAccountsPanel,
  };
}
