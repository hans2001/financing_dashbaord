import { useQuery } from "@tanstack/react-query";

import { FAMILY_AUTH_HEADERS } from "../dashboard-utils";
import type { Account } from "../types";

type AccountsArgs = {
  refreshKey: number;
};

export function useAccountsData({ refreshKey }: AccountsArgs) {
  const accountsQuery = useQuery<Account[]>({
    queryKey: ["accounts", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/accounts", {
        headers: FAMILY_AUTH_HEADERS,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load accounts");
      }
      return payload.accounts ?? [];
    },
  });

  const accounts = accountsQuery.data ?? [];
  const isLoadingAccounts = accountsQuery.isPending;
  const accountsError =
    accountsQuery.error instanceof Error
      ? accountsQuery.error.message
      : accountsQuery.error
        ? "Failed to fetch accounts"
        : null;

  return {
    accounts,
    isLoadingAccounts,
    accountsError,
  };
}
