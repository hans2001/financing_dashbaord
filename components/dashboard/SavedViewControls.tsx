"use client";

import { useCallback, useMemo } from "react";

import type {
  SavedViewMetadata,
  SerializedSavedView,
} from "./types/workspace";

type SavedViewControlsProps = {
  savedViews: SerializedSavedView[];
  activeSavedViewId: string | null;
  isLoading: boolean;
  error: string | null;
  onViewSelect: (viewId: string) => void;
  onSaveView: (name: string, options?: { isPinned?: boolean }) => void;
  isSaving: boolean;
  saveError: string | null;
  currentViewMetadata: SavedViewMetadata;
};

export function SavedViewControls({
  savedViews,
  activeSavedViewId,
  isLoading,
  error,
  onViewSelect,
  onSaveView,
  isSaving,
  saveError,
  currentViewMetadata,
}: SavedViewControlsProps) {
  const currentViewId =
    activeSavedViewId ?? savedViews[0]?.id ?? "";

  const viewLabel = useMemo(() => {
    if (!currentViewMetadata) {
      return "Filters: all accounts";
    }
    const selected = currentViewMetadata.selectedAccountIds?.length ?? 0;
    if (selected === 0) {
      return "Filters: all accounts";
    }
    return `Accounts: ${selected} saved`;
  }, [currentViewMetadata]);

  const handleSaveClick = useCallback(() => {
    const name = window.prompt("Name this view");
    if (!name) {
      return;
    }
    onSaveView(name.trim(), { isPinned: false });
  }, [onSaveView]);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">
            Saved views
          </p>
          <div className="flex items-center gap-2">
            <select
              className="min-w-[13rem] rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              value={currentViewId}
              onChange={(event) => {
                const next = event.target.value;
                if (!next) {
                  return;
                }
                onViewSelect(next);
              }}
              disabled={isLoading || !savedViews.length}
            >
              {savedViews.length === 0 && (
                <option value="">No saved views yet</option>
              )}
              {savedViews.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                  {view.isPinned ? " (pinned)" : ""}
                </option>
              ))}
            </select>
            {isLoading && (
              <span className="text-[0.65rem] text-slate-500">Loading…</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSaveClick}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save view"}
        </button>
      </div>
      {error && (
        <p className="text-[0.65rem] text-rose-600">{error}</p>
      )}
      {saveError && (
        <p className="text-[0.65rem] text-rose-600">{saveError}</p>
      )}
      <p className="text-[0.7rem] text-slate-500">{viewLabel} · {currentViewMetadata?.pageSize ?? "Auto"} rows</p>
    </div>
  );
}
