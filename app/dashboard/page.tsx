'use client'

import { FiltersPanel } from "@/components/dashboard/FiltersPanel";
import { SummaryPanel } from "@/components/dashboard/SummaryPanel";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { useDashboardState } from "@/components/dashboard/useDashboardState";

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
    sortOption,
    setSortOption,
    onPreviousPage,
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
                sortOption={sortOption}
                onSortOptionChange={setSortOption}
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
                hasSelection={hasSelection}
                onPreviousPage={onPreviousPage}
                onNextPage={onNextPage}
                onClearSelection={onClearSelection}
                hasNextPage={hasNextPage}
                onDescriptionSaved={handleDescriptionSaved}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-[0.15] flex-col gap-3 xl:min-w-[280px]">
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
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
                    Linked accounts
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {accounts.length} connected
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 underline-offset-2 hover:text-slate-800"
                  onClick={() => setShowAccountsPanel((prev) => !prev)}
                >
                  {showAccountsPanel ? "Less" : "Details"}
                </button>
              </div>
              {isLoadingAccounts ? (
                <p className="mt-4 text-sm text-slate-500">
                  Loading linked accounts…
                </p>
              ) : accountsError ? (
                <p className="mt-4 text-sm text-red-600">{accountsError}</p>
              ) : (
                <div className="mt-2 flex-1 overflow-y-auto pr-1 text-[0.85rem] text-slate-700">
                  {(showAccountsPanel ? accounts : accounts.slice(0, 4)).map(
                    (account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between border-b border-slate-100 py-1 text-sm last:border-none"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {account.name}
                          </p>
                          <p className="text-[0.6rem] text-slate-500">
                            {account.institutionName ?? "Plaid"}
                          </p>
                        </div>
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">
                          {account.type}
                        </p>
                      </div>
                    ),
                  )}
                  {accounts.length > 4 && !showAccountsPanel && (
                    <p className="pt-2 text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
                      +{accounts.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
