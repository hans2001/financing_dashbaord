"use client";

import { useMemo, useState } from "react";

import type { Account } from "./types";
import type {
  SavedViewMetadata,
  SerializedSavedView,
} from "./types/workspace";
import { SavedViewControls } from "./SavedViewControls";

type SavedViewHeroProps = {
  savedViews: SerializedSavedView[];
  activeSavedViewId: string | null;
  currentViewMetadata: SavedViewMetadata;
  accounts: Account[];
  selectedAccounts: string[];
  onAccountChange: (value: string[]) => void;
  isLoading: boolean;
  error: string | null;
  onViewSelect: (viewId: string) => void;
  onSaveView: (
    name: string,
    options?: { isPinned?: boolean; viewId?: string | null },
  ) => void;
  isSaving: boolean;
  saveError: string | null;
};

type SavedViewTab = "views" | "manage";

const tabDefinitions: Record<SavedViewTab, { label: string }> = {
  views: { label: "Saved views" },
  manage: { label: "Manage accounts" },
};

export function SavedViewHero({
  accounts,
  savedViews,
  activeSavedViewId,
  selectedAccounts,
  onAccountChange,
  isLoading,
  error,
  onViewSelect,
  onSaveView,
  isSaving,
  saveError,
  currentViewMetadata,
}: SavedViewHeroProps) {
  const [activeTab, setActiveTab] = useState<SavedViewTab>("views");
  const activeView = useMemo(
    () =>
      savedViews.find((view) => view.id === activeSavedViewId) ?? savedViews[0],
    [activeSavedViewId, savedViews],
  );
  const currentViewId = activeView?.id ?? null;
  const [draftState, setDraftState] = useState(() => ({
    viewId: currentViewId,
    value: activeView?.name ?? "",
  }));
  const isDraftForCurrentView = draftState.viewId === currentViewId;
  const draftName = isDraftForCurrentView
    ? draftState.value
    : activeView?.name ?? "";

  const handleDraftNameChange = (value: string) => {
    setDraftState({ viewId: currentViewId, value });
  };

  const normalizedSelectedAccounts = useMemo(() => {
    if (selectedAccounts.includes("all")) {
      return accounts.map((account) => account.id);
    }
    return selectedAccounts;
  }, [accounts, selectedAccounts]);

  const allAccountsSelected =
    accounts.length > 0 &&
    normalizedSelectedAccounts.length === accounts.length;

  const toggleAccount = (accountId: string) => {
    const nextSet = new Set(normalizedSelectedAccounts);
    if (nextSet.has(accountId)) {
      nextSet.delete(accountId);
    } else {
      nextSet.add(accountId);
    }
    const nextSelection =
      nextSet.size === 0 ? ["all"] : Array.from(nextSet).filter(Boolean);
    onAccountChange(nextSelection);
  };

  const handleSelectAll = () => {
    if (accounts.length === 0) {
      return;
    }
    onAccountChange(["all"]);
  };

  const handleUpdateView = () => {
    if (!draftName.trim() || !activeSavedViewId) {
      return;
    }
    onSaveView(draftName.trim(), { viewId: activeSavedViewId });
  };

  const handleSaveNewView = () => {
    if (!draftName.trim()) {
      return;
    }
    onSaveView(draftName.trim());
  };

  return (
    <section className="w-full space-y-3">
      <nav className="flex items-center gap-2">
        {(Object.keys(tabDefinitions) as SavedViewTab[]).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
              activeTab === tabKey
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() => setActiveTab(tabKey)}
          >
            {tabDefinitions[tabKey].label}
          </button>
        ))}
      </nav>
      {activeTab === "views" && (
        <SavedViewControls
          savedViews={savedViews}
          activeSavedViewId={activeSavedViewId}
          isLoading={isLoading}
          error={error}
          onViewSelect={onViewSelect}
          onSaveView={onSaveView}
          isSaving={isSaving}
          saveError={saveError}
          currentViewMetadata={currentViewMetadata}
        />
      )}
      <p className="text-[0.65rem] text-slate-500">
        {activeTab === "views"
          ? "Browsing saved views"
          : "Managing account bindings for a view"}
      </p>
      {activeTab === "manage" && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-900/5">
          <div className="space-y-1">
            <label
              htmlFor="managed-view-name"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500"
            >
              View name
            </label>
            <input
              id="managed-view-name"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              value={draftName}
              onChange={(event) => handleDraftNameChange(event.target.value)}
              placeholder={
                activeView ? `Editing "${activeView.name}"` : "Name this view"
              }
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Select accounts</p>
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700"
                onClick={handleSelectAll}
              >
                Select all
              </button>
            </div>
            <div className="grid gap-2 text-sm">
              {accounts.length === 0 && (
                <p className="text-xs text-slate-500">No linked accounts yet.</p>
              )}
              {accounts.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-slate-400"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    checked={
                      normalizedSelectedAccounts.includes(account.id) || allAccountsSelected
                    }
                    onChange={() => toggleAccount(account.id)}
                  />
                  <span className="truncate">{account.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeSavedViewId ? (
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                onClick={handleUpdateView}
              >
                {isSaving ? "Saving…" : "Update view"}
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={handleSaveNewView}
            >
              {isSaving ? "Saving…" : "Save new view"}
            </button>
          </div>
          {(error || saveError) && (
            <p className="text-[0.65rem] text-rose-600">
              {saveError ?? error}
            </p>
          )}
          <p className="text-[0.65rem] text-slate-500">
            {allAccountsSelected
              ? "All accounts are selected."
              : `${normalizedSelectedAccounts.length} / ${accounts.length} accounts selected.`}
          </p>
        </div>
      )}
    </section>
  );
}
