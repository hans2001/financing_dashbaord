import { getCategoryBadge, formatCurrency, truncateInline } from "./dashboard-utils";
import type { Transaction } from "./types";
import { DescriptionEditor } from "./DescriptionEditor";
import { memo } from "react";

type TransactionsTableProps = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  selectedTransactionIds: Set<string>;
  toggleSelectRow: (id: string) => void;
  toggleSelectPage: () => void;
  isAllVisibleSelected: boolean;
  totalTransactions: number;
  showingStart: number;
  showingEnd: number;
  currentPage: number;
  totalPages: number;
  hasSelection: boolean;
  isShowingAllRows: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onClearSelection: () => void;
  onDescriptionSaved: (transactionId: string, description: string | null) => void;
};

function TransactionsTableComponent({
  transactions,
  isLoading,
  error,
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
  isShowingAllRows,
  hasPreviousPage,
  hasNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onClearSelection,
  onDescriptionSaved,
}: TransactionsTableProps) {
  return (
    <>
      <div className="mt-4 flex-1 overflow-x-auto">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading transactions...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No transactions were found for this range.
          </p>
        ) : (
          <table className="min-w-full table-fixed text-left text-xs">
            <colgroup>
              <col style={{ width: "1.5rem" }} />
              <col style={{ width: "5rem" }} />
              <col style={{ width: "2rem" }} />
              <col style={{ width: "6rem" }} />
              <col style={{ width: "6rem" }} />
              <col style={{ width: "2rem" }} />
              <col />
              <col style={{ width: "2rem" }} />
            </colgroup>
            <thead className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="py-1.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                    checked={isAllVisibleSelected}
                    onChange={toggleSelectPage}
                  />
                </th>
                <th className="py-1.5">Date</th>
                <th className="py-1.5">Status</th>
                <th className="py-1.5">Account</th>
                <th className="py-1.5">Merchant / Name</th>
                <th className="py-1.5">Category</th>
                <th className="py-1.5 pr-4">Description</th>
                <th className="py-1.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {transactions.map((tx) => {
                const categoryBadge = getCategoryBadge(tx.categoryPath);
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-100 text-xs last:border-none"
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                        checked={selectedTransactionIds.has(tx.id)}
                        onChange={() => toggleSelectRow(tx.id)}
                      />
                    </td>
                    <td className="text-[0.75rem] text-slate-500">
                      <div>{tx.date}</div>
                      {tx.time && (
                        <p className="text-[0.65rem] text-slate-400">
                          {tx.time}
                        </p>
                      )}
                    </td>
                    <td className="min-w-[4rem]">
                      <span
                        className={
                          tx.pending
                            ? "rounded-full bg-amber-100 px-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-amber-700"
                            : "rounded-full bg-emerald-100 px-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-emerald-700"
                        }
                      >
                        {tx.pending ? "Pending" : "Posted"}
                      </span>
                    </td>
                    <td className="min-w-[6rem]">{tx.accountName}</td>
                    <td className="w-[18rem] max-w-[18rem]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-xs font-medium text-slate-900"
                          title={tx.merchantName ?? tx.name}
                        >
                          {truncateInline(tx.merchantName ?? tx.name)}
                        </span>
                      </div>
                      {(tx.location?.city || tx.paymentMeta?.payment_channel) && (
                        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
                          {[tx.location?.city, tx.location?.region]
                            .filter(Boolean)
                            .join(", ")}
                          {tx.paymentMeta?.payment_channel
                            ? ` • ${tx.paymentMeta.payment_channel}`
                            : ""}
                        </p>
                      )}
                    </td>
                    <td className="text-[0.75rem]">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] ${categoryBadge?.bg} ${categoryBadge?.text} ${categoryBadge?.border}`}
                      >
                        {categoryBadge?.label}
                      </span>
                    </td>
                    <td className="w-[12rem] text-[0.75rem] text-slate-500">
                      <div className="flex w-full max-w-full items-center overflow-x-auto whitespace-nowrap">
                        <DescriptionEditor
                          transactionId={tx.id}
                          value={tx.description ?? ""}
                          onSaved={(next) => onDescriptionSaved(tx.id, next)}
                        />
                      </div>
                    </td>
                    <td className="text-right text-sm font-medium">
                      <span
                        className={
                          tx.amount < 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }
                      >
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[0.75rem] text-slate-500">
          {totalTransactions === 0 ? (
            "No transactions to display."
          ) : isShowingAllRows ? (
            <>
              Showing all{" "}
              <span className="font-semibold text-slate-700">
                {totalTransactions}
              </span>{" "}
              results
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-700">
                {showingStart}-{showingEnd}
              </span>{" "}
              of {totalTransactions} results
            </>
          )}
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
            {isShowingAllRows
              ? "All rows in this date range"
              : `Page ${Math.min(currentPage + 1, totalPages)} of ${totalPages}`}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
            onClick={onClearSelection}
            disabled={!hasSelection}
          >
            Clear selection
          </button>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-sm text-slate-600">
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Go to first page"
              title="First page"
              onClick={onFirstPage}
              disabled={!hasPreviousPage}
            >
              «
            </button>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Go to previous page"
              title="Previous page"
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
            >
              ‹
            </button>
            <span className="px-2 text-[0.75rem] text-slate-500">
              {Math.min(currentPage + 1, totalPages)}
            </span>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Go to next page"
              title="Next page"
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              ›
            </button>
            <button
              type="button"
              className="rounded-full px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Go to last page"
              title="Last page"
              onClick={onLastPage}
              disabled={!hasNextPage}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export const TransactionsTable = memo(TransactionsTableComponent);
