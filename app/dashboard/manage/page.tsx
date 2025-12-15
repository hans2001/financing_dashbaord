"use client";

import { ManageWorkspace } from "@/components/dashboard/ManageWorkspace";
import { useDashboardState } from "@/components/dashboard/useDashboardState";

export default function DashboardManagePage() {
  const {
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
    setSelectedAccounts,
  } = useDashboardState();

  // Manage workspace has a dedicated route so the dashboard view remains uncluttered.
  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Manage saved views
          </h1>
          <p className="text-sm text-slate-500">
            Define account filters, pinned views, and metadata without clipping the main dashboard experience.
          </p>
        </div>
        <ManageWorkspace
          accounts={accounts}
          isLoadingAccounts={isLoadingAccounts}
          accountsError={accountsError}
          savedViews={savedViews}
          activeSavedViewId={activeSavedViewId}
          isSavedViewsLoading={isSavedViewsLoading}
          savedViewsError={savedViewsError}
          isActivatingView={isActivatingView}
          activateError={activateError}
          handleSavedViewSelect={handleSavedViewSelect}
          handleSaveCurrentView={handleSaveCurrentView}
          isSavingView={isSavingView}
          saveViewError={saveViewError}
          currentViewMetadata={currentViewMetadata}
          selectedAccounts={selectedAccounts}
          onSelectedAccountsChange={setSelectedAccounts}
        />
      </div>
    </main>
  );
}
