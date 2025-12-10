import { memo } from "react";
import type { Account } from "./types";
import {
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "./dashboard-utils";
import type { PageSizeOptionValue } from "./dashboard-utils";

type FiltersPanelProps = {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (next: { start: string; end: string }) => void;
  pageSize: PageSizeOptionValue;
  onPageSizeChange: (value: PageSizeOptionValue) => void;
  flowFilter: string;
  onFlowFilterChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
};

function FiltersPanelComponent({
  accounts,
  selectedAccount,
  onAccountChange,
  dateRange,
  onDateRangeChange,
  pageSize,
  onPageSizeChange,
  flowFilter,
  onFlowFilterChange,
  sortOption,
  onSortOptionChange,
}: FiltersPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
      <div className="grid w-full gap-3 text-[0.5rem] uppercase tracking-[0.35em] text-slate-400 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Account</span>
          <select
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={selectedAccount}
            onChange={(event) => onAccountChange(event.target.value)}
          >
            <option value="all">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">From</span>
          <input
            type="date"
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={dateRange.start}
            onChange={(event) =>
              onDateRangeChange({ start: event.target.value, end: dateRange.end })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">To</span>
          <input
            type="date"
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={dateRange.end}
            onChange={(event) =>
              onDateRangeChange({ start: dateRange.start, end: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Rows</span>
          <select
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={String(pageSize)}
            onChange={(event) => {
              const value = event.target.value;
              onPageSizeChange(
                (value === "all" ? "all" : Number(value)) as PageSizeOptionValue,
              );
            }}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option value={String(option.value)} key={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Flow</span>
          <select
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={flowFilter}
            onChange={(event) => onFlowFilterChange(event.target.value)}
          >
            {FLOW_FILTERS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Sort</span>
          <select
            className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            value={sortOption}
            onChange={(event) => onSortOptionChange(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export const FiltersPanel = memo(FiltersPanelComponent);
