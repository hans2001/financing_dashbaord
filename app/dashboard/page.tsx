'use client'

import { Suspense, lazy, useState } from "react";

import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { LinkedAccountsPanel } from "@/components/dashboard/LinkedAccountsPanel";
import { ManageWorkspace } from "@/components/dashboard/ManageWorkspace";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { useDashboardState } from "@/components/dashboard/useDashboardState";

const SummaryPanel = lazy(() =>
  import("@/components/dashboard/SummaryPanel").then((mod) => ({
    default: mod.SummaryPanel,
  })),
);

type DashboardPrimaryMode = "view" | "manage";

const dashboardPrimaryModeLabels: Record<DashboardPrimaryMode, string> = {
  view: "View",
  manage: "Manage",
};

export default function DashboardPage() {
  const [activeMode, setActiveMode] = useState<DashboardPrimaryMode>("view");
  const {
    accounts,
    isLoadingAccounts,
    accountsError,
    transactions,
    isLoadingTransactions,
    transactionsError,
    selectedTransactionIds,
    toggleSelectRow,
    toggleSelectPage,
    isAllVisibleSelected,
    totalTransactions,
    showingStart,
    showingEnd,
    currentPage,
    totalPages,
    isShowingAllRows,
    hasPreviousPage,
    hasSelection,
    categoriesToShow,
    categoryEmptyMessage,
    summaryRowsLabel,
    summaryErrorText,
    activeSpentTotal,
    activeIncomeTotal,
    activeSpendCount,
    activeIncomeCount,
    activeLargestExpense,
    activeLargestIncome,
    setSelectedAccounts,
    setDateRange,
    setPageSize,
    setSortOption,
    setFlowFilter,
    setCategoryFilter,
    onPreviousPage,
    onFirstPage,
    onLastPage,
    onNextPage,
    hasNextPage,
    onClearSelection,
    handleDescriptionSaved,
    handleSync,
    isSyncing,
    showAccountsPanel,
    setShowAccountsPanel,
    areFiltersCollapsed,
    setAreFiltersCollapsed,
    selectedAccounts,
    dateRange,
    pageSize,
    sortOption,
    flowFilter,
    categoryFilter,
    categoryOptions,
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
  } = useDashboardState();

  const renderOverview = (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <div className="flex min-w-0 flex-[0.85] flex-col gap-3">
        <div className="flex flex-1 flex-col gap-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
          <div className="w-full">
            <FiltersPanel
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              flowFilter={flowFilter}
              onFlowFilterChange={setFlowFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categoryOptions={categoryOptions}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              isCollapsed={areFiltersCollapsed}
              onToggleCollapsed={() =>
                setAreFiltersCollapsed((previous) => !previous)
              }
            />
          </div>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoadingTransactions}
            error={transactionsError}
            selectedTransactionIds={selectedTransactionIds}
            toggleSelectRow={toggleSelectRow}
            toggleSelectPage={toggleSelectPage}
            isAllVisibleSelected={isAllVisibleSelected}
            totalTransactions={totalTransactions}
            showingStart={showingStart}
            showingEnd={showingEnd}
            currentPage={currentPage}
            totalPages={totalPages}
            isShowingAllRows={isShowingAllRows}
            hasSelection={hasSelection}
            hasPreviousPage={hasPreviousPage}
            onPreviousPage={onPreviousPage}
            onFirstPage={onFirstPage}
            onNextPage={onNextPage}
            onLastPage={onLastPage}
            onClearSelection={onClearSelection}
            hasNextPage={hasNextPage}
            onDescriptionSaved={handleDescriptionSaved}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-[0.15] flex-col gap-3 xl:min-w-[280px]">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
              Loading summary…
            </div>
          }
        >
          <SummaryPanel
            activeSpentTotal={activeSpentTotal}
            activeIncomeTotal={activeIncomeTotal}
            summaryRowsLabel={summaryRowsLabel}
            summaryErrorText={summaryErrorText}
            dateRange={dateRange}
            activeSpendCount={activeSpendCount}
            activeIncomeCount={activeIncomeCount}
            activeLargestExpense={activeLargestExpense}
            activeLargestIncome={activeLargestIncome}
            categoriesToShow={categoriesToShow}
            categoryEmptyMessage={categoryEmptyMessage}
          />
        </Suspense>
        <LinkedAccountsPanel
          accounts={accounts}
          isLoading={isLoadingAccounts}
          error={accountsError}
          showAll={showAccountsPanel}
          onToggleShow={() => setShowAccountsPanel((prev) => !prev)}
          onRefresh={handleSync}
          isSyncing={isSyncing}
        />
      </div>
    </section>
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <nav className="flex flex-wrap items-center gap-2">
              {(Object.keys(dashboardPrimaryModeLabels) as DashboardPrimaryMode[]).map(
                (modeKey) => (
                  <button
                    key={modeKey}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeMode === modeKey
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() => setActiveMode(modeKey)}
                  >
                    {dashboardPrimaryModeLabels[modeKey]}
                  </button>
                ),
              )}
            </nav>
          </div>
          <div className="flex w-full items-center justify-end sm:w-auto">
            <button
              type="button"
              className="inline-flex min-w-[13rem] items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? "Syncing..." : "Sync latest transactions"}
            </button>
          </div>
        </section>
        {activeMode === "view" ? (
          renderOverview
        ) : (
          <ManageWorkspace
            accounts={accounts}
            isLoadingAccounts={isLoadingAccounts}
            accountsError={accountsError}
            showAccountsPanel={showAccountsPanel}
            onToggleShowAccountsPanel={() =>
              setShowAccountsPanel((prev) => !prev)
            }
            onRefreshAccounts={handleSync}
            isSyncing={isSyncing}
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
        )}
      </div>
    </main>
  );
}
