import { useCallback, useMemo, useState } from "react";

import type { Transaction } from "../types";

export type SelectionAggregates = {
  selectedTransactionIds: Set<string>;
  toggleSelectRow: (id: string) => void;
  toggleSelectPage: () => void;
  onClearSelection: () => void;
  isAllVisibleSelected: boolean;
  hasSelection: boolean;
  selection: Transaction[];
  selectionSpentTotal: number;
  selectionIncomeTotal: number;
  selectedLargestExpense: number;
  selectedLargestIncome: number;
  selectionSpendCount: number;
  selectionIncomeCount: number;
  selectionCategoryTotals: Record<string, number>;
};

export function useSelectionState(
  transactions: Transaction[],
): SelectionAggregates {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Set<string>
  >(new Set());

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedTransactionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectPage = useCallback(() => {
    if (transactions.length === 0) {
      return;
    }
    setSelectedTransactionIds((prev) => {
      const allSelected = transactions.every((tx) => prev.has(tx.id));
      const next = new Set(prev);
      if (allSelected) {
        transactions.forEach((tx) => next.delete(tx.id));
      } else {
        transactions.forEach((tx) => next.add(tx.id));
      }
      return next;
    });
  }, [transactions]);

  const onClearSelection = useCallback(() => {
    setSelectedTransactionIds(new Set());
  }, []);

  const isAllVisibleSelected =
    transactions.length > 0 &&
    transactions.every((tx) => selectedTransactionIds.has(tx.id));

  const selection = useMemo(
    () => transactions.filter((tx) => selectedTransactionIds.has(tx.id)),
    [selectedTransactionIds, transactions],
  );
  const hasSelection = selection.length > 0;

  const selectionSpending = useMemo(
    () => selection.filter((tx) => tx.amount < 0),
    [selection],
  );
  const selectionIncome = useMemo(
    () => selection.filter((tx) => tx.amount > 0),
    [selection],
  );
  const selectionSpentTotal = useMemo(
    () =>
      selectionSpending.reduce(
        (sum: number, tx: Transaction) => sum + Math.abs(tx.amount),
        0,
      ),
    [selectionSpending],
  );
  const selectionIncomeTotal = useMemo(
    () =>
      selectionIncome.reduce(
        (sum: number, tx: Transaction) => sum + tx.amount,
        0,
      ),
    [selectionIncome],
  );
  const selectedLargestExpense = useMemo(() => {
    if (selectionSpending.length === 0) return 0;
    return Math.max(...selectionSpending.map((tx) => Math.abs(tx.amount)));
  }, [selectionSpending]);
  const selectedLargestIncome = useMemo(() => {
    if (selectionIncome.length === 0) return 0;
    return Math.max(...selectionIncome.map((tx) => tx.amount));
  }, [selectionIncome]);
  const selectionSpendCount = selectionSpending.length;
  const selectionIncomeCount = selectionIncome.length;
  const selectionCategoryTotals = useMemo(() => {
    return selectionSpending.reduce<Record<string, number>>(
      (collector, tx) => {
        const label = tx.categoryPath ?? "Uncategorized";
        collector[label] = (collector[label] ?? 0) + Math.abs(tx.amount);
        return collector;
      },
      {},
    );
  }, [selectionSpending]);

  return {
    selectedTransactionIds,
    toggleSelectRow,
    toggleSelectPage,
    onClearSelection,
    isAllVisibleSelected,
    hasSelection,
    selection,
    selectionSpentTotal,
    selectionIncomeTotal,
    selectedLargestExpense,
    selectedLargestIncome,
    selectionSpendCount,
    selectionIncomeCount,
    selectionCategoryTotals,
  };
}
