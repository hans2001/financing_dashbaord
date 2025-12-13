import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Account, Transaction } from "./types";
import type {
  FlowFilterValue,
  PageSizeOptionValue,
  SortOptionValue,
} from "./dashboard-utils";
import {
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "./dashboard-utils";
import { useSyncControls } from "./hooks/useSyncControls";
import { useAccountsData } from "./hooks/useAccountsData";
import {
  TransactionsQueryResult,
  useTransactionsData,
} from "./hooks/useTransactionsData";
import { useSummaryData } from "./hooks/useSummaryData";
import { useSelectionState } from "./hooks/useSelectionState";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useSavedViewsState } from "./hooks/useSavedViewsState";
import type {
  SavedViewMetadata,
  SerializedSavedView,
} from "./types/workspace";
import { isIsoDateString } from "./forms/dashboardFiltersForm";

type DashboardState = {
  accounts: Account[];
  isLoadingAccounts: boolean;
  accountsError: string | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;
  totalTransactions: number;
  selectedTransactionIds: Set<string>;
  selectedAccounts: string[];
  dateRange: { start: string; end: string };
  pageSize: PageSizeOptionValue;
  sortOption: SortOptionValue;
  flowFilter: FlowFilterValue;
  categoryFilter: string;
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
  categoryOptions: string[];
  activeSpentTotal: number;
  activeIncomeTotal: number;
  activeSpendCount: number;
  activeIncomeCount: number;
  activeLargestExpense: number;
  activeLargestIncome: number;
  isSyncing: boolean;
  syncMessage: string | null;
  showAccountsPanel: boolean;
  savedViews: SerializedSavedView[];
  activeSavedViewId: string | null;
  isSavedViewsLoading: boolean;
  savedViewsError: string | null;
  isActivatingView: boolean;
  isSavingView: boolean;
  activateError: string | null;
  saveViewError: string | null;
  currentViewMetadata: SavedViewMetadata;
  areFiltersCollapsed: boolean;
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
  setSelectedAccounts: (value: string[]) => void;
  setDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  setPageSize: (value: PageSizeOptionValue) => void;
  setSortOption: (value: SortOptionValue) => void;
  setFlowFilter: (value: FlowFilterValue) => void;
  setCategoryFilter: (value: string) => void;
  handleSync: () => Promise<void>;
  setShowAccountsPanel: Dispatch<SetStateAction<boolean>>;
  handleSavedViewSelect: (viewId: string) => Promise<void>;
  handleSaveCurrentView: (
    name: string,
    options?: { isPinned?: boolean; viewId?: string | null },
  ) => Promise<void>;
  setAreFiltersCollapsed: Dispatch<SetStateAction<boolean>>;
};

export function useDashboardState(): DashboardState & DashboardActions {
  const { refreshKey, handleSync, isSyncing, syncMessage } = useSyncControls();
  const [showAccountsPanel, setShowAccountsPanel] = useState(false);
  const queryClient = useQueryClient();
  const {
    savedViews,
    activeSavedViewId,
    isSavedViewsLoading,
    savedViewsError,
    isActivatingView,
    activateError,
    activateView,
    isSavingView,
    saveView,
    saveViewError,
  } = useSavedViewsState({ refreshKey });
  const appliedSavedViewIdRef = useRef<string | null>(null);
  const [areFiltersCollapsed, setAreFiltersCollapsed] = useState(true);
  const {
    selectedAccounts,
    setSelectedAccounts: setSelectedAccountsFilter,
    dateRange,
    setDateRange: setDateRangeFilter,
    pageSize,
    setPageSize: setPageSizeFilter,
    sortOption,
    setSortOption: setSortOptionFilter,
    flowFilter,
    setFlowFilter: setFlowFilterFilter,
    categoryFilter,
    setCategoryFilter: setCategoryFilterFilter,
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
    selectedAccounts,
    dateRange,
    pageSize,
    currentPage,
    sortOption,
    flowFilter,
    categoryFilter,
    refreshKey,
    hasDateRange,
  });

  const { summaryData, isLoadingSummary, summaryError } = useSummaryData({
    selectedAccounts,
    dateRange,
    categoryFilter,
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

  const setSelectedAccountsFromView = useCallback(
    (value: string[]) => {
      onClearSelection();
      setSelectedAccountsFilter(value);
    },
    [onClearSelection, setSelectedAccountsFilter],
  );

  const handleSelectedAccountsChange = useCallback(
    (value: string[]) => {
      onClearSelection();
      setSelectedAccountsFilter(value);
    },
    [onClearSelection, setSelectedAccountsFilter],
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
    (value: SortOptionValue) => {
      onClearSelection();
      setSortOptionFilter(value);
    },
    [onClearSelection, setSortOptionFilter],
  );

  const setFlowFilter = useCallback(
    (value: FlowFilterValue) => {
      onClearSelection();
      setFlowFilterFilter(value);
    },
    [onClearSelection, setFlowFilterFilter],
  );
  const setCategoryFilter = useCallback(
    (value: string) => {
      onClearSelection();
      setCategoryFilterFilter(value);
    },
    [onClearSelection, setCategoryFilterFilter],
  );

  const applySavedViewMetadata = useCallback(
    (view: SerializedSavedView) => {
      const metadata = view.metadata ?? null;
      const normalizedAccounts = Array.isArray(metadata?.selectedAccountIds)
        ? metadata.selectedAccountIds.filter(Boolean)
        : [];
      if (normalizedAccounts.length > 0) {
        setSelectedAccountsFromView(normalizedAccounts);
      } else {
        setSelectedAccountsFromView(["all"]);
      }

      if (
        metadata?.dateRange?.start &&
        metadata.dateRange?.end &&
        isIsoDateString(metadata.dateRange.start) &&
        isIsoDateString(metadata.dateRange.end)
      ) {
        setDateRange({
          start: metadata.dateRange.start,
          end: metadata.dateRange.end,
        });
      }

      if (
        metadata?.pageSize !== undefined &&
        metadata?.pageSize !== null &&
        PAGE_SIZE_OPTIONS.some((option) => option.value === metadata.pageSize)
      ) {
        setPageSize(metadata.pageSize as PageSizeOptionValue);
      }

      const flowValue = metadata?.flowFilter;
      if (
        typeof flowValue === "string" &&
        FLOW_FILTERS.some((option) => option.value === flowValue)
      ) {
        setFlowFilter(flowValue as FlowFilterValue);
      }

      const categoryValue = metadata?.categoryFilter;
      if (typeof categoryValue === "string") {
        setCategoryFilter(categoryValue);
      }

      const sortValue = metadata?.sortOption;
      if (
        typeof sortValue === "string" &&
        SORT_OPTIONS.some((option) => option.value === sortValue)
      ) {
        setSortOption(sortValue as SortOptionValue);
      }

      if (typeof metadata?.filtersCollapsed === "boolean") {
        setAreFiltersCollapsed(metadata.filtersCollapsed);
      }
    },
    [
      setAreFiltersCollapsed,
      setCategoryFilter,
      setDateRange,
      setFlowFilter,
      setPageSize,
      setSelectedAccountsFromView,
      setSortOption,
    ],
  );

  const currentViewMetadata = useMemo<SavedViewMetadata>(() => {
    const selectedAccountIds = selectedAccounts.filter(
      (id) => Boolean(id) && id !== "all",
    );
    const dateRangeValue =
      hasDateRange &&
      isIsoDateString(dateRange.start) &&
      isIsoDateString(dateRange.end)
        ? { start: dateRange.start, end: dateRange.end }
        : null;
    return {
      selectedAccountIds,
      dateRange: dateRangeValue,
      flowFilter,
      categoryFilter,
      sortOption,
      pageSize,
      filtersCollapsed: areFiltersCollapsed,
    };
  }, [
    selectedAccounts,
    hasDateRange,
    dateRange.start,
    dateRange.end,
    flowFilter,
    categoryFilter,
    sortOption,
    pageSize,
    areFiltersCollapsed,
  ]);

  const handleSavedViewSelect = useCallback(
    async (viewId: string) => {
      appliedSavedViewIdRef.current = null;
      await activateView(viewId);
    },
    [activateView],
  );

  const handleSaveCurrentView = useCallback(
    async (
      name: string,
      options?: { isPinned?: boolean; viewId?: string | null },
    ) => {
      await saveView({
        id: options?.viewId ?? undefined,
        name,
        metadata: currentViewMetadata,
        columnConfig: null,
        isPinned: Boolean(options?.isPinned),
      });
    },
    [currentViewMetadata, saveView],
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

  // We intentionally sync view metadata to filter state here after queries load.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const targetView = savedViews.find(
      (view: SerializedSavedView) => view.id === activeSavedViewId,
    );
    if (!targetView) {
      return;
    }
    if (appliedSavedViewIdRef.current === targetView.id) {
      return;
    }
    applySavedViewMetadata(targetView);
    appliedSavedViewIdRef.current = targetView.id;
  }, [activeSavedViewId, applySavedViewMetadata, savedViews]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const allCategoryOptions = useMemo(() => {
    if (!summaryData) {
      return [];
    }
    const optionSet = new Set<string>();
    const spendKeys = Object.keys(summaryData.categoryTotals ?? {});
    const incomeKeys = Object.keys(summaryData.incomeCategoryTotals ?? {});
    for (const key of [...spendKeys, ...incomeKeys]) {
      if (key?.trim()) {
        optionSet.add(key);
      }
    }
    return Array.from(optionSet).sort((a, b) => a.localeCompare(b));
  }, [summaryData]);

  const categoryOptions = useMemo(() => {
    const optionSet = new Set(allCategoryOptions);
    if (categoryFilter !== "all" && categoryFilter.trim().length > 0) {
      optionSet.add(categoryFilter);
    }
    return Array.from(optionSet).sort((a, b) => a.localeCompare(b));
  }, [allCategoryOptions, categoryFilter]);
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
    selectedAccounts,
    dateRange,
    pageSize,
    sortOption,
    flowFilter,
    categoryFilter,
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
    categoryOptions,
    activeSpentTotal,
    activeIncomeTotal,
    activeSpendCount,
    activeIncomeCount,
    activeLargestExpense,
    activeLargestIncome,
    showAccountsPanel,
    savedViews,
    activeSavedViewId,
    isSavedViewsLoading,
    savedViewsError,
    isActivatingView,
    isSavingView,
    activateError,
    saveViewError,
    currentViewMetadata,
    areFiltersCollapsed,
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
    setSelectedAccounts: handleSelectedAccountsChange,
    setDateRange,
    setPageSize,
    setSortOption,
    setFlowFilter,
    setCategoryFilter,
    handleSync,
    setShowAccountsPanel,
    handleSavedViewSelect,
    handleSaveCurrentView,
    setAreFiltersCollapsed,
  };
}
