"use client";

import { useMemo, useState } from "react";

import type { Account } from "./types";
import type {
  SavedViewMetadata,
  SerializedSavedView,
} from "./types/workspace";
import { LinkedAccountsPanel } from "./LinkedAccountsPanel";
import { SavedViewControls } from "./SavedViewControls";

type ManageWorkspaceProps = {
  accounts: Account[];
  isLoadingAccounts: boolean;
  accountsError: string | null;
  showAccountsPanel: boolean;
  onToggleShowAccountsPanel: () => void;
  onRefreshAccounts: () => Promise<void>;
  isSyncing: boolean;
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

type ManageTab = "views" | "manage" | "accounts";

const tabDefinitions: Record<ManageTab, { label: string; description: string }> = {
  views: {
    label: "Saved views",
    description: "Switch between reusable filter sets and save fresh ones.",
  },
  manage: {
    label: "Manage views",
    description:
      "Rename the active view or choose which accounts power it.",
  },
  accounts: {
    label: "Linked accounts",
    description: "Review and refresh connected institutions in one place.",
  },
};

const NEW_VIEW_DRAFT_KEY = "__new-view-draft__";

export function ManageWorkspace({
  accounts,
  isLoadingAccounts,
  accountsError,
  showAccountsPanel,
  onToggleShowAccountsPanel,
  onRefreshAccounts,
  isSyncing,
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
  const [activeTab, setActiveTab] = useState<ManageTab>("views");

  const activeView = useMemo(
    () =>
      savedViews.find((view) => view.id === activeSavedViewId) ??
      savedViews[0],
    [activeSavedViewId, savedViews],
  );

  const currentViewId = activeView?.id ?? null;

  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const currentDraftKey = currentViewId ?? NEW_VIEW_DRAFT_KEY;
  const currentDraftName = draftNames[currentDraftKey];
  const draftName = currentDraftName ?? activeView?.name ?? "";

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
      nextSet.size === 0
        ? ["all"]
        : Array.from(nextSet).filter(Boolean);
    onSelectedAccountsChange(nextSelection);
  };

  const handleSelectAll = () => {
    if (accounts.length === 0) {
      return;
    }
    onSelectedAccountsChange(["all"]);
  };

  const handleDraftNameChange = (value: string) => {
    setDraftNames((previous) => ({
      ...previous,
      [currentDraftKey]: value,
    }));
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

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-2">
          {(Object.keys(tabDefinitions) as ManageTab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
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
        <p className="text-[0.65rem] text-slate-500">
          {tabDefinitions[activeTab].description}
        </p>
      </div>
      {activeTab === "views" && (
        <SavedViewControls
          savedViews={savedViews}
          activeSavedViewId={activeSavedViewId}
          isLoading={isSavedViewsLoading || isActivatingView}
          error={savedViewsError ?? activateError ?? null}
          onViewSelect={handleSavedViewSelect}
          onSaveView={handleSaveCurrentView}
          isSaving={isSavingView}
          saveError={saveViewError}
          currentViewMetadata={currentViewMetadata}
        />
      )}
      {activeTab === "manage" && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm shadow-slate-900/5">
          <div className="space-y-1">
            <label
              htmlFor="managed-view-name"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500"
            >
              View name
            </label>
            <input
              id="managed-view-name"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
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
                      normalizedSelectedAccounts.includes(account.id) ||
                      allAccountsSelected
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
                disabled={isSavingView}
                onClick={handleUpdateView}
              >
                {isSavingView ? "Saving…" : "Update view"}
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSavingView}
              onClick={handleSaveNewView}
            >
              {isSavingView ? "Saving…" : "Save new view"}
            </button>
          </div>
          {(saveViewError || savedViewsError || activateError) && (
            <p className="text-[0.65rem] text-rose-600">
              {saveViewError ?? savedViewsError ?? activateError}
            </p>
          )}
          <p className="text-[0.65rem] text-slate-500">
            {allAccountsSelected
              ? "All accounts are selected."
              : `${normalizedSelectedAccounts.length} / ${accounts.length} accounts selected.`}
          </p>
        </div>
      )}
      {activeTab === "accounts" && (
        <LinkedAccountsPanel
          accounts={accounts}
          isLoading={isLoadingAccounts}
          error={accountsError}
          showAll={showAccountsPanel}
          onToggleShow={onToggleShowAccountsPanel}
          onRefresh={onRefreshAccounts}
          isSyncing={isSyncing}
        />
      )}
    </section>
  );
}
