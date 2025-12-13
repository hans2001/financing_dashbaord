"use client";

import { useCallback } from "react";
import type {
  SavedViewMetadata,
  SavedViewsResponse,
  SerializedSavedView,
} from "../types/workspace";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getFamilyAuthHeaders } from "../dashboard-utils";

type SavedViewsStateArgs = {
  refreshKey: number;
};

type SaveViewPayload = {
  id?: string | null;
  name: string;
  metadata: SavedViewMetadata;
  columnConfig?: unknown | null;
  isPinned?: boolean;
};

export function useSavedViewsState({ refreshKey }: SavedViewsStateArgs) {
  const queryClient = useQueryClient();

  const savedViewsQuery = useQuery<SavedViewsResponse, Error, SavedViewsResponse>({
    queryKey: ["saved-views", refreshKey],
    queryFn: async ({ signal }): Promise<SavedViewsResponse> => {
      const response = await fetch("/api/workspaces/views", {
        headers: getFamilyAuthHeaders(),
        signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        const errorPayload = payload as { error?: string };
        throw new Error(errorPayload.error ?? "Unable to load saved views");
      }
      return payload as SavedViewsResponse;
    },
    placeholderData: keepPreviousData,
  });

  const activateViewMutation = useMutation({
    mutationFn: async (viewId: string) => {
      const response = await fetch(
        `/api/workspaces/views/${encodeURIComponent(viewId)}/activate`,
        {
          method: "POST",
          headers: getFamilyAuthHeaders(),
        },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to activate saved view");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views", refreshKey] });
    },
  });

  const saveViewMutation = useMutation({
    mutationFn: async (payload: SaveViewPayload) => {
      const response = await fetch("/api/workspaces/views", {
        method: "POST",
        headers: {
          ...getFamilyAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save view");
      }
      return data.view as SerializedSavedView;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-views", refreshKey] });
    },
  });

  const savedViews = savedViewsQuery.data?.savedViews ?? [];
  const activeSavedViewId = savedViewsQuery.data?.activeSavedViewId ?? null;

  return {
    savedViews,
    activeSavedViewId,
    isSavedViewsLoading: savedViewsQuery.isPending,
    savedViewsError:
      savedViewsQuery.error instanceof Error
        ? savedViewsQuery.error.message
        : null,
    activateView: useCallback(
      (viewId: string) => activateViewMutation.mutateAsync(viewId),
      [activateViewMutation],
    ),
    isActivatingView: activateViewMutation.isPending,
    activateError:
      activateViewMutation.error instanceof Error
        ? activateViewMutation.error.message
        : null,
    saveView: useCallback(
      (payload: SaveViewPayload) => saveViewMutation.mutateAsync(payload),
      [saveViewMutation],
    ),
    isSavingView: saveViewMutation.isPending,
    saveViewError:
      saveViewMutation.error instanceof Error
        ? saveViewMutation.error.message
        : null,
  };
}
