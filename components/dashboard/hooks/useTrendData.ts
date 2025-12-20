import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { FlowFilterValue } from "../dashboard-utils";
import { getNormalizedAccountSelection } from "./useTransactionsData";

export type TrendBucket = {
  date: string;
  spent: number;
  income: number;
};

type TrendResponse = {
  buckets?: TrendBucket[];
};

type TrendArgs = {
  selectedAccounts: string[];
  dateRange: { start: string; end: string };
  flowFilter: FlowFilterValue;
  categoryFilters: string[];
  refreshKey: number;
  hasDateRange: boolean;
};

const normalizeCategoryFilters = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter(Boolean),
    ),
  );

const buildTrendSearchParams = ({
  selectedAccounts,
  dateRange,
  flowFilter,
  categoryFilters,
}: Pick<
  TrendArgs,
  "selectedAccounts" | "dateRange" | "flowFilter" | "categoryFilters"
>) => {
  const params = new URLSearchParams();
  const normalizedAccountIds = getNormalizedAccountSelection(selectedAccounts);
  normalizedAccountIds.forEach((accountId) => {
    params.append("accountId", accountId);
  });
  params.set("startDate", dateRange.start);
  params.set("endDate", dateRange.end);
  params.set("flow", flowFilter);
  const normalizedCategories = normalizeCategoryFilters(categoryFilters);
  normalizedCategories.forEach((category) => {
    params.append("category", category);
  });
  return params;
};

export function useTrendData({
  selectedAccounts,
  dateRange,
  flowFilter,
  categoryFilters,
  refreshKey,
  hasDateRange,
}: TrendArgs) {
  const normalizedAccountIds = useMemo(
    () => getNormalizedAccountSelection(selectedAccounts),
    [selectedAccounts],
  );
  const accountFilterKey =
    normalizedAccountIds.length > 0 ? normalizedAccountIds.join(",") : "all";
  const normalizedCategories = useMemo(
    () => normalizeCategoryFilters(categoryFilters),
    [categoryFilters],
  );
  const categoryFiltersKey =
    normalizedCategories.length === 0
      ? "all"
      : normalizedCategories.slice().sort().join(",");

  const queryKey = useMemo(
    () =>
      [
        "transactions-trends",
        accountFilterKey,
        dateRange.start,
        dateRange.end,
        flowFilter,
        categoryFiltersKey,
        refreshKey,
      ] as const,
    [
      accountFilterKey,
      dateRange.start,
      dateRange.end,
      flowFilter,
      categoryFiltersKey,
      refreshKey,
    ],
  );

  const trendQuery = useQuery<TrendResponse>({
    queryKey,
    enabled: hasDateRange,
    queryFn: async () => {
      const params = buildTrendSearchParams({
        selectedAccounts,
        dateRange,
        flowFilter,
        categoryFilters: normalizedCategories,
      });

      const response = await fetch(`/api/transactions/trends?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load trend data");
      }
      return payload;
    },
  });

  const trendPayload = trendQuery.data ?? { buckets: [] };
  const trendBuckets = trendPayload.buckets ?? [];
  const isLoadingTrend = !hasDateRange || trendQuery.isPending;
  const trendError =
    !hasDateRange
      ? null
      : trendQuery.error instanceof Error
        ? trendQuery.error.message
        : trendQuery.error
          ? "Failed to fetch trend data"
          : null;

  return {
    trendBuckets,
    isLoadingTrend,
    trendError,
    trendQueryKey: queryKey,
  };
}
