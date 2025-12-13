import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { FAMILY_AUTH_HEADERS } from "../dashboard-utils";
import type { Transaction } from "../types";
import type {
  FlowFilterValue,
  SortOptionValue,
} from "../dashboard-utils";

export type TransactionsQueryResult = {
  transactions: Transaction[];
  total: number;
};

type TransactionsArgs = {
  selectedAccounts: string[];
  dateRange: { start: string; end: string };
  pageSize: number | "all";
  currentPage: number;
  sortOption: SortOptionValue;
  flowFilter: FlowFilterValue;
  categoryFilter: string;
  refreshKey: number;
  hasDateRange: boolean;
};

const EMPTY_RESULT: TransactionsQueryResult = {
  transactions: [],
  total: 0,
};

export function useTransactionsData({
  selectedAccounts,
  dateRange,
  pageSize,
  currentPage,
  sortOption,
  flowFilter,
  categoryFilter,
  refreshKey,
  hasDateRange,
}: TransactionsArgs) {
  const normalizedAccountIds = useMemo(() => {
    const filteredIds = selectedAccounts.filter(Boolean);
    if (filteredIds.includes("all")) {
      return [];
    }
    return Array.from(new Set(filteredIds));
  }, [selectedAccounts]);

  const accountFilterKey =
    normalizedAccountIds.length > 0 ? normalizedAccountIds.join(",") : "all";

  const queryKey = useMemo(
    () =>
      [
        "transactions",
        accountFilterKey,
        dateRange.start,
        dateRange.end,
        pageSize,
        currentPage,
        sortOption,
        flowFilter,
        categoryFilter,
        refreshKey,
      ] as const,
    [
      accountFilterKey,
      dateRange.start,
      dateRange.end,
      pageSize,
      currentPage,
      sortOption,
      flowFilter,
      categoryFilter,
      refreshKey,
    ],
  );
  const transactionsQuery = useQuery<TransactionsQueryResult>({
    queryKey,
    enabled: hasDateRange,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (pageSize === "all") {
        params.set("limit", "all");
        params.set("offset", "0");
      } else {
        params.set("limit", pageSize.toString());
        params.set("offset", (currentPage * pageSize).toString());
      }
      for (const accountId of normalizedAccountIds) {
        params.append("accountId", accountId);
      }
      params.set("startDate", dateRange.start);
      params.set("endDate", dateRange.end);
      params.set("sort", sortOption);
      params.set("flow", flowFilter);
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

      const response = await fetch(`/api/transactions?${params.toString()}`, {
        headers: FAMILY_AUTH_HEADERS,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load transactions");
      }
      return {
        transactions: payload.transactions ?? [],
        total: payload.total ?? 0,
      };
    },
  });

  const transactionsPayload = transactionsQuery.data ?? EMPTY_RESULT;
  const transactions = transactionsPayload.transactions;
  const totalTransactions = transactionsPayload.total;
  const isLoadingTransactions =
    !hasDateRange || transactionsQuery.isPending;
  const transactionsError =
    !hasDateRange
      ? null
      : transactionsQuery.error instanceof Error
        ? transactionsQuery.error.message
        : transactionsQuery.error
          ? "Failed to fetch transactions"
          : null;

  return {
    transactions,
    totalTransactions,
    isLoadingTransactions,
    transactionsError,
    queryKey,
  };
}
