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
  onPreviousPage: () => void;
  onNextPage: () => void;
  onClearSelection: () => void;
  hasNextPage: boolean;
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
  onPreviousPage,
  onNextPage,
  onClearSelection,
  hasNextPage,
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
      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {totalTransactions === 0
            ? "No transactions to display."
            : `Showing ${showingStart}-${showingEnd} of ${totalTransactions}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
            onClick={onClearSelection}
            disabled={!hasSelection}
          >
            Clear selection
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
            onClick={onPreviousPage}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export const TransactionsTable = memo(TransactionsTableComponent);
