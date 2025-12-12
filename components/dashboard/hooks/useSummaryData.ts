import { useQuery } from "@tanstack/react-query";

import { FAMILY_AUTH_HEADERS } from "../dashboard-utils";
import type { SummaryResponse } from "../types";

type SummaryArgs = {
  selectedAccount: string;
  dateRange: { start: string; end: string };
  categoryFilter: string;
  refreshKey: number;
  hasDateRange: boolean;
};

export function useSummaryData({
  selectedAccount,
  dateRange,
  categoryFilter,
  refreshKey,
  hasDateRange,
}: SummaryArgs) {
  const summaryQuery = useQuery<SummaryResponse>({
    queryKey: [
      "transactions-summary",
      selectedAccount,
      dateRange.start,
      dateRange.end,
      categoryFilter,
      refreshKey,
    ],
    enabled: hasDateRange,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedAccount !== "all") {
        params.set("accountId", selectedAccount);
      }
      params.set("startDate", dateRange.start);
      params.set("endDate", dateRange.end);
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

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
      return payload as SummaryResponse;
    },
  });

  const summaryData = summaryQuery.data ?? null;
  const isLoadingSummary = !hasDateRange || summaryQuery.isPending;
  const summaryError =
    !hasDateRange
      ? null
      : summaryQuery.error instanceof Error
        ? summaryQuery.error.message
        : summaryQuery.error
          ? "Failed to fetch spending summary"
          : null;

  return {
    summaryData,
    isLoadingSummary,
    summaryError,
  };
}
