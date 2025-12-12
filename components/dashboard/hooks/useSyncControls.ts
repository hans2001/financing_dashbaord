import { useCallback, useState } from "react";

import { FAMILY_AUTH_HEADERS } from "../dashboard-utils";

export type SyncControls = {
  refreshKey: number;
  isSyncing: boolean;
  syncMessage: string | null;
  handleSync: () => Promise<void>;
};

export function useSyncControls(): SyncControls {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
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
  }, []);

  return {
    refreshKey,
    isSyncing,
    syncMessage,
    handleSync,
  };
}
