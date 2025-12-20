import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getNormalizedAccountSelection } from "./useTransactionsData";

type UseCategorySnapshotArgs = {
  selectedAccounts: string[];
  dateRange: { start: string; end: string };
  refreshKey: number;
  hasDateRange: boolean;
};

export function useCategorySnapshot({
  selectedAccounts,
  dateRange,
  refreshKey,
  hasDateRange,
}: UseCategorySnapshotArgs) {
  const normalizedAccountIds = useMemo(
    () => getNormalizedAccountSelection(selectedAccounts),
    [selectedAccounts],
  );

  const accountFilterKey =
    normalizedAccountIds.length > 0 ? normalizedAccountIds.join(",") : "all";

  const queryKey = useMemo(
    () =>
      [
        "transactions-categories",
        accountFilterKey,
        dateRange.start,
        dateRange.end,
        refreshKey,
      ] as const,
    [accountFilterKey, dateRange.start, dateRange.end, refreshKey],
  );

  const categoriesQuery = useQuery<string[]>({
    queryKey,
    enabled: hasDateRange,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = new URLSearchParams();
      normalizedAccountIds.forEach((accountId) => {
        params.append("accountId", accountId);
      });
      params.set("startDate", dateRange.start);
      params.set("endDate", dateRange.end);

      const response = await fetch(
        `/api/transactions/categories?${params.toString()}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load categories");
      }
      if (!Array.isArray(payload.categories)) {
        return [];
      }
      const normalizedCategories: string[] = Array.from(
        new Set<string>(
          payload.categories
            .map((value: unknown) =>
              typeof value === "string" ? value.trim() : "",
            )
            .filter((value: string): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b));
      return normalizedCategories;
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoadingCategories: !hasDateRange || categoriesQuery.isPending,
  };
}
