import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Account, Transaction } from "./types";
import type { PageSizeOptionValue } from "./dashboard-utils";
import { useSyncControls } from "./hooks/useSyncControls";
import { useAccountsData } from "./hooks/useAccountsData";
import {
  TransactionsQueryResult,
  useTransactionsData,
} from "./hooks/useTransactionsData";
import { useSummaryData } from "./hooks/useSummaryData";
import { useSelectionState } from "./hooks/useSelectionState";
import { useDashboardFilters } from "./hooks/useDashboardFilters";

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
  const { refreshKey, handleSync, isSyncing, syncMessage } = useSyncControls();
  const [showAccountsPanel, setShowAccountsPanel] = useState(false);
  const queryClient = useQueryClient();
  const {
    selectedAccount,
    setSelectedAccount: setSelectedAccountFilter,
    dateRange,
    setDateRange: setDateRangeFilter,
    pageSize,
    setPageSize: setPageSizeFilter,
    sortOption,
    setSortOption: setSortOptionFilter,
    flowFilter,
    setFlowFilter: setFlowFilterFilter,
    currentPage,
    setCurrentPage,
    numericPageSize,
    isShowingAllRows,
  } = useDashboardFilters();

  const hasDateRange = Boolean(dateRange.start && dateRange.end);

  const {
    accounts,
    isLoadingAccounts,
    accountsError,
  } = useAccountsData({ refreshKey });

  const {
    transactions,
    totalTransactions,
    isLoadingTransactions,
    transactionsError,
    queryKey: transactionsQueryKey,
  } = useTransactionsData({
    selectedAccount,
    dateRange,
    pageSize,
    currentPage,
    sortOption,
    flowFilter,
    refreshKey,
    hasDateRange,
  });

  const { summaryData, isLoadingSummary, summaryError } = useSummaryData({
    selectedAccount,
    dateRange,
    refreshKey,
    hasDateRange,
  });

  const {
    selectedTransactionIds,
    toggleSelectRow,
    toggleSelectPage,
    onClearSelection,
    isAllVisibleSelected,
    hasSelection,
    selection,
    selectionSpentTotal,
    selectionIncomeTotal,
    selectedLargestExpense,
    selectedLargestIncome,
    selectionSpendCount,
    selectionIncomeCount,
    selectionCategoryTotals,
  } = useSelectionState(transactions);

  const setSelectedAccount = useCallback(
    (value: string) => {
      onClearSelection();
      setSelectedAccountFilter(value);
    },
    [onClearSelection, setSelectedAccountFilter],
  );

  const setDateRange = useCallback(
    (value: SetStateAction<{ start: string; end: string }>) => {
      onClearSelection();
      setDateRangeFilter(value);
    },
    [onClearSelection, setDateRangeFilter],
  );

  const setPageSize = useCallback(
    (value: PageSizeOptionValue) => {
      onClearSelection();
      setPageSizeFilter(value);
    },
    [onClearSelection, setPageSizeFilter],
  );

  const setSortOption = useCallback(
    (value: string) => {
      onClearSelection();
      setSortOptionFilter(value);
    },
    [onClearSelection, setSortOptionFilter],
  );

  const setFlowFilter = useCallback(
    (value: string) => {
      onClearSelection();
      setFlowFilterFilter(value);
    },
    [onClearSelection, setFlowFilterFilter],
  );

  const handleDescriptionSaved = useCallback(
    (transactionId: string, description: string | null) => {
      queryClient.setQueryData<TransactionsQueryResult | undefined>(
        transactionsQueryKey,
        (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            transactions: prev.transactions.map((transaction) =>
              transaction.id === transactionId
                ? { ...transaction, description: description ?? null }
                : transaction,
            ),
          };
        },
      );
    },
    [queryClient, transactionsQueryKey],
  );

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
  const hasPreviousPage = !isShowingAllRows && currentPage > 0;
  const hasNextPage =
    !isShowingAllRows &&
    (currentPage + 1) * numericPageSize < totalTransactions;

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
    showAccountsPanel,
    isSyncing,
    syncMessage,
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
