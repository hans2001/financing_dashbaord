'use client'

import type { Account } from "./types";
import { formatCurrency } from "./dashboard-utils";

type LinkedAccountsPanelProps = {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  showAll: boolean;
  onToggleShow: () => void;
  onRefresh: () => Promise<void>;
  isSyncing: boolean;
};

const formatBalanceValue = (value?: number | null) =>
  typeof value === "number" ? formatCurrency(value) : "--";

const formatBalanceTimestamp = (value?: string | null) => {
  if (!value) {
    return "No balance data yet";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No balance data yet";
  }
  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export function LinkedAccountsPanel({
  accounts,
  isLoading,
  error,
  showAll,
  onToggleShow,
  onRefresh,
  isSyncing,
}: LinkedAccountsPanelProps) {
  const visibleAccounts = showAll ? accounts : accounts.slice(0, 4);

  return (
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
          onClick={onToggleShow}
        >
          {showAll ? "Less" : "Details"}
        </button>
      </div>
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading linked accounts…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : (
        <div className="mt-2 flex-1 overflow-y-auto pr-1 text-[0.85rem] text-slate-700">
          {visibleAccounts.map((account) => {
            const availableLabel = formatBalanceValue(
              typeof account.availableBalance === "number"
                ? account.availableBalance
                : account.currentBalance,
            );
            const currentLabel = formatBalanceValue(account.currentBalance);
            const limitLabel = formatBalanceValue(account.creditLimit);
            const showDepository =
              account.type?.toLowerCase() === "depository";
            const showCurrentDetail =
              typeof account.availableBalance === "number" &&
              typeof account.currentBalance === "number" &&
              account.availableBalance !== account.currentBalance;
            return (
              <div
                key={account.id}
                className="border-b border-slate-100 py-2 text-sm last:border-none"
                data-testid="account-row"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {account.name}
                      </p>
                      {account.isBalanceStale && (
                        <span className="rounded-full bg-amber-100 px-2 py-[1px] text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-amber-700">
                          Stale
                        </span>
                      )}
                    </div>
                    <p className="text-[0.6rem] text-slate-500">
                      {account.institutionName ?? "Plaid"}
                    </p>
                    <p className="text-[0.55rem] text-slate-400">
                      {formatBalanceTimestamp(account.balanceLastUpdated)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-900">
                    {showDepository ? (
                      <>
                        <p className="font-semibold">{availableLabel}</p>
                        {showCurrentDetail && (
                          <p className="text-[0.6rem] text-slate-500">
                            Current · {currentLabel}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">{currentLabel}</p>
                        <p className="text-[0.6rem] text-slate-500">
                          Limit · {limitLabel}
                        </p>
                      </>
                    )}
                    <p className="text-[0.55rem] uppercase tracking-[0.25em] text-slate-400">
                      {account.type}
                    </p>
                  </div>
                </div>
                {account.isBalanceStale && (
                  <div className="mt-1 flex items-center justify-between text-[0.55rem] text-slate-500">
                    <span>Balance older than 24h</span>
                    <button
                      type="button"
                      className="font-semibold uppercase tracking-[0.2em] text-amber-700 underline-offset-2 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => {
                        void onRefresh();
                      }}
                      disabled={isSyncing}
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {accounts.length > 4 && !showAll && (
            <p className="pt-2 text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
              +{accounts.length - 4} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
