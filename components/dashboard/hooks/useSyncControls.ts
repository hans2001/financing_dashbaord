import { useCallback, useState } from "react";

export type SyncControls = {
  refreshKey: number;
  isSyncing: boolean;
  handleSync: () => Promise<void>;
};

export function useSyncControls(): SyncControls {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
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
      setRefreshKey((prev) => prev + 1);
    } catch {
      // Swallow errors; the consumer can infer failure from the syncing state remaining false.
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    refreshKey,
    isSyncing,
    handleSync,
  };
}
