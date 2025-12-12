'use client'

import { Suspense, lazy, useState } from "react";

import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { LinkedAccountsPanel } from "@/components/dashboard/LinkedAccountsPanel";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { useDashboardState } from "@/components/dashboard/useDashboardState";

const SummaryPanel = lazy(() =>
  import("@/components/dashboard/SummaryPanel").then((mod) => ({
    default: mod.SummaryPanel,
  })),
);

export default function DashboardPage() {
  const [areFiltersCollapsed, setAreFiltersCollapsed] = useState(true);
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
    pageSize,
    setPageSize,
    selectedAccount,
    setSelectedAccount,
    dateRange,
    setDateRange,
    flowFilter,
    setFlowFilter,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    sortOption,
    setSortOption,
    onPreviousPage,
    onFirstPage,
    onLastPage,
    onNextPage,
    hasNextPage,
    onClearSelection,
    handleDescriptionSaved,
    handleSync,
    isSyncing,
    syncMessage,
    showAccountsPanel,
    setShowAccountsPanel,
  } = useDashboardState();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white px-4 py-2 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Accounts & spending
            </h1>
          </div>
          <div className="flex w-full justify-end sm:w-auto">
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                className="inline-flex min-w-[13rem] items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync latest transactions"}
              </button>
              <p className="text-[0.65rem] text-slate-500">
                {syncMessage ?? "Last synced when this page loaded."}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-[0.85] flex-col gap-4">
            <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
              <FiltersPanel
                accounts={accounts}
                selectedAccount={selectedAccount}
                onAccountChange={setSelectedAccount}
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
      </div>
    </main>
  );
}
