'use client'

import { Suspense, lazy } from "react";

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
  setDateRange,
  setPageSize,
  setSortOption,
  setFlowFilter,
  setCategoryFilters,
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
  setSelectedAccounts,
  dateRange,
  pageSize,
  sortOption,
  flowFilter,
  categoryFilters,
  trendBuckets,
  isLoadingTrend,
  trendError,
  categoryOptions,
  isLoadingCategoryOptions,
} = useDashboardState();

  const renderOverview = (
    <section className="flex flex-col gap-1 xl:flex-row xl:items-stretch">
      <div className="flex min-w-0 flex-[0.85] flex-col gap-2 h-full">
        <FiltersPanel
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          categoryFilters={categoryFilters}
          onCategoryFiltersChange={setCategoryFilters}
          categoryOptions={categoryOptions}
          isLoadingCategories={isLoadingCategoryOptions}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          flowFilter={flowFilter}
          onFlowFilterChange={setFlowFilter}
          isCollapsed={areFiltersCollapsed}
          onToggleCollapsed={() =>
            setAreFiltersCollapsed((previous) => !previous)
          }
          isSyncing={isSyncing}
          onSync={handleSync}
          accounts={accounts}
          selectedAccounts={selectedAccounts}
          onSelectedAccountsChange={setSelectedAccounts}
        />
        <div className="flex flex-1 flex-col gap-0 rounded-xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-900/5">
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

      <div className="flex min-w-0 flex-[0.15] flex-col gap-2 xl:min-w-[280px] xl:h-full">
        <Suspense
          fallback={
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
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
          trendBuckets={trendBuckets}
          isLoadingTrend={isLoadingTrend}
          trendError={trendError}
          flowFilter={flowFilter}
          categoryFilters={categoryFilters}
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
    <main className="px-4 pt-4 pb-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
        {renderOverview}
      </div>
    </main>
  );
}
