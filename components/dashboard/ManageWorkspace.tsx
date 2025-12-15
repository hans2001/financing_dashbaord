"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import type { Account } from "./types";
import type {
  SavedViewMetadata,
  SerializedSavedView,
} from "./types/workspace";
import {
  FLOW_FILTERS,
  formatBalanceTimestamp,
  formatBalanceValue,
} from "./dashboard-utils";

type ManageWorkspaceProps = {
  accounts: Account[];
  isLoadingAccounts: boolean;
  accountsError: string | null;
  savedViews: SerializedSavedView[];
  activeSavedViewId: string | null;
  isSavedViewsLoading: boolean;
  savedViewsError: string | null;
  isActivatingView: boolean;
  activateError: string | null;
  handleSavedViewSelect: (viewId: string) => Promise<void>;
  handleSaveCurrentView: (
    name: string,
    options?: { isPinned?: boolean; viewId?: string | null },
  ) => Promise<void>;
  isSavingView: boolean;
  saveViewError: string | null;
  currentViewMetadata: SavedViewMetadata;
  selectedAccounts: string[];
  onSelectedAccountsChange: (value: string[]) => void;
};

export function ManageWorkspace({
  accounts,
  isLoadingAccounts,
  accountsError,
  savedViews,
  activeSavedViewId,
  isSavedViewsLoading,
  savedViewsError,
  isActivatingView,
  activateError,
  handleSavedViewSelect,
  handleSaveCurrentView,
  isSavingView,
  saveViewError,
  currentViewMetadata,
  selectedAccounts,
  onSelectedAccountsChange,
}: ManageWorkspaceProps) {
  const activeView = useMemo(() => {
    if (!savedViews.length) {
      return null;
    }
    return (
      savedViews.find((view) => view.id === activeSavedViewId) ??
      savedViews[0]
    );
  }, [activeSavedViewId, savedViews]);

  const currentViewId = activeView?.id ?? null;

  const [draftValue, setDraftValue] = useState(() => activeView?.name ?? "");
  const [draftViewId, setDraftViewId] = useState<string | null>(currentViewId);

  const isDraftForCurrentView = draftViewId === currentViewId;
  const draftName = isDraftForCurrentView
    ? draftValue
    : activeView?.name ?? "";

  const normalizedSelectedAccounts = useMemo(() => {
    if (selectedAccounts.includes("all")) {
      return accounts.map((account) => account.id);
    }
    return selectedAccounts;
  }, [accounts, selectedAccounts]);

  const allAccountsSelected =
    accounts.length > 0 &&
    normalizedSelectedAccounts.length === accounts.length;

  const viewMetadata = currentViewMetadata ?? activeView?.metadata ?? null;
  const flowLabel = viewMetadata?.flowFilter
    ? FLOW_FILTERS.find((filter) => filter.value === viewMetadata.flowFilter)
        ?.label
    : null;
  const categoryLabel =
    viewMetadata?.categoryFilter && viewMetadata.categoryFilter !== "all"
      ? viewMetadata.categoryFilter
      : null;
  const filterSegments = [flowLabel, categoryLabel].filter(Boolean) as string[];
  const filterLegend =
    filterSegments.length > 0 ? filterSegments.join(" · ") : "All accounts";
  const pageSizeLabel = (() => {
    if (typeof viewMetadata?.pageSize === "number") {
      return `${viewMetadata.pageSize} rows`;
    }
    if (viewMetadata?.pageSize === "all") {
      return "All rows";
    }
    return "Auto rows";
  })();
  const filtersSummary = `Filters: ${filterLegend} · ${pageSizeLabel}`;

  const dateRangeLabel =
    viewMetadata?.dateRange?.start && viewMetadata?.dateRange?.end
      ? `${viewMetadata.dateRange.start} → ${viewMetadata.dateRange.end}`
      : "Open range";

  const selectionLabel = accounts.length === 0
    ? "No accounts available"
    : allAccountsSelected
    ? "All accounts attached"
    : `${normalizedSelectedAccounts.length} / ${accounts.length} attached`;

  const statusMessage =
    saveViewError ?? savedViewsError ?? activateError ?? null;

  const handleSelectAll = () => {
    if (!accounts.length) {
      return;
    }
    onSelectedAccountsChange(["all"]);
  };

  const handleDraftNameChange = (value: string) => {
    setDraftValue(value);
    setDraftViewId(currentViewId);
  };

  const handleUpdateView = () => {
    if (!draftName.trim() || !activeSavedViewId) {
      return;
    }
    void handleSaveCurrentView(draftName.trim(), {
      viewId: activeSavedViewId,
    });
  };

  const handleSaveNewView = () => {
    if (!draftName.trim()) {
      return;
    }
    void handleSaveCurrentView(draftName.trim());
  };

  const handleViewSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    if (!next) {
      return;
    }
    void handleSavedViewSelect(next);
  };

  const trimmedDraftName = draftName.trim();
  const canSaveNewView = Boolean(trimmedDraftName) && !isSavingView;

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="flex flex-col gap-4">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="saved-view-select"
                  className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400"
                >
                  Saved views
                </label>
                <select
                  id="saved-view-select"
                  className="min-w-[12rem] rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                  value={currentViewId ?? ""}
                  onChange={handleViewSelect}
                  disabled={isSavedViewsLoading || !savedViews.length}
                >
                  {savedViews.length === 0 ? (
                    <option value="">No saved views yet</option>
                  ) : (
                    savedViews.map((view) => (
                      <option key={view.id} value={view.id}>
                        {view.name}
                        {view.isPinned ? " (pinned)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex min-w-[10rem] items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleUpdateView}
                  disabled={isSavingView || !activeSavedViewId}
                >
                  {isSavingView ? "Saving…" : "Update active view"}
                </button>
                <p className="text-[0.65rem] text-slate-500">
                  Applies to the selected saved view.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="manage-view-name"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500"
              >
                View name
              </label>
              <input
                id="manage-view-name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                value={draftName}
                onChange={(event) => handleDraftNameChange(event.target.value)}
                placeholder={
                  activeView ? `Editing "${activeView.name}"` : "Name this view"
                }
                disabled={isSavingView || isSavedViewsLoading}
              />
            </div>
            <div className="flex flex-col gap-3 text-[0.7rem] text-slate-500 sm:flex-row sm:items-center sm:flex-wrap">
              <p>{filtersSummary}</p>
              <p>{dateRangeLabel}</p>
              <span className="rounded-md bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                {selectionLabel}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="inline-flex min-w-[10rem] items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveNewView}
                disabled={!canSaveNewView}
              >
                {isSavingView ? "Saving…" : "Save as new view"}
              </button>
              <p className="text-[0.65rem] text-slate-500">
                Creates a new saved view with the current filters and selected accounts.
              </p>
            </div>
            {(statusMessage || isActivatingView || isSavedViewsLoading) && (
              <p className="text-[0.65rem] text-rose-600">
                {statusMessage ?? "Loading views…"}
              </p>
            )}
          </div>
        </div>
        <div className="flex h-full flex-col gap-3">
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                  Linked accounts
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {accounts.length} connected · {selectionLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                  onClick={handleSelectAll}
                  disabled={isSavingView || accounts.length === 0}
                >
                  Attach all
                </button>
              </div>
            </div>
            {isLoadingAccounts ? (
              <p className="text-sm text-slate-500">Loading linked accounts…</p>
            ) : accountsError ? (
              <p className="text-sm text-rose-600">{accountsError}</p>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-slate-500">No linked accounts yet.</p>
            ) : (
              <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
                {accounts.map((account) => {
                  const isAttached = normalizedSelectedAccounts.includes(account.id);
                  const badgeText = isAttached ? "Attached" : "Available";
                  const balanceLabel = formatBalanceValue(account.currentBalance);
                  return (
                    <label
                      key={account.id}
                      className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm hover:border-slate-300"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        checked={isAttached}
                        onChange={() => {
                          const nextSet = new Set(normalizedSelectedAccounts);
                          if (nextSet.has(account.id)) {
                            nextSet.delete(account.id);
                          } else {
                            nextSet.add(account.id);
                          }
                          const nextSelection =
                            nextSet.size === 0
                              ? ["all"]
                              : Array.from(nextSet).filter(Boolean);
                          onSelectedAccountsChange(nextSelection);
                        }}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{account.name}</p>
                          <span
                            className={`rounded-sm px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${
                              isAttached
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {badgeText}
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-slate-500">
                          {account.institutionName ?? "Plaid"} · {account.type}
                        </p>
                        <p className="text-[0.65rem] text-slate-500">
                          {formatBalanceTimestamp(account.balanceLastUpdated)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-900">
                        <p className="font-semibold">{balanceLabel}</p>
                        <p className="text-[0.65rem] text-slate-500">Current balance</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
