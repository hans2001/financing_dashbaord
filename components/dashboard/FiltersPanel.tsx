import { memo, useEffect, useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import type { Account } from "./types";
import {
  FLOW_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "./dashboard-utils";
import type {
  FlowFilterValue,
  PageSizeOptionValue,
  SortOptionValue,
} from "./dashboard-utils";
import {
  DashboardFiltersFormValues,
  dashboardFiltersResolver,
  isIsoDateString,
} from "./forms/dashboardFiltersForm";

type FiltersPanelProps = {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (next: { start: string; end: string }) => void;
  pageSize: PageSizeOptionValue;
  onPageSizeChange: (value: PageSizeOptionValue) => void;
  flowFilter: FlowFilterValue;
  onFlowFilterChange: (value: FlowFilterValue) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: string[];
  sortOption: SortOptionValue;
  onSortOptionChange: (value: SortOptionValue) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
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
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  sortOption,
  onSortOptionChange,
  isCollapsed,
  onToggleCollapsed,
}: FiltersPanelProps) {
  const {
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<DashboardFiltersFormValues>({
    defaultValues: {
      accountId: selectedAccount,
      start: dateRange.start,
      end: dateRange.end,
      pageSize: normalizePageSize(pageSize),
      flowFilter,
      categoryFilter,
      sortOption,
    },
    resolver: dashboardFiltersResolver,
    mode: "all",
  });

  useEffect(() => {
    reset({
      accountId: selectedAccount,
      start: dateRange.start,
      end: dateRange.end,
      pageSize: normalizePageSize(pageSize),
      flowFilter,
      categoryFilter,
      sortOption,
    });
  }, [
    reset,
    selectedAccount,
    dateRange.start,
    dateRange.end,
    pageSize,
    flowFilter,
    categoryFilter,
    sortOption,
  ]);

  const dateError = errors.start?.message ?? errors.end?.message;

  const filtersId = useId();
  const filtersGridClassName = [
    "grid w-full gap-3 text-[0.5rem] uppercase tracking-[0.35em] text-slate-400",
    "sm:grid-cols-2 lg:grid-cols-7",
    isCollapsed ? "hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const normalizedCategoryOptions = useMemo(() => {
    if (
      categoryFilter !== "all" &&
      categoryFilter.trim().length > 0 &&
      !categoryOptions.includes(categoryFilter)
    ) {
      return [categoryFilter, ...categoryOptions];
    }
    return categoryOptions;
  }, [categoryFilter, categoryOptions]);

  const handleDateChange = (field: "start" | "end", value: string) => {
    const otherField = field === "start" ? "end" : "start";
    const otherValue = getValues(otherField);
    if (!isIsoDateString(value) || !isIsoDateString(otherValue)) {
      return;
    }
    const nextRange =
      field === "start"
        ? { start: value, end: otherValue }
        : { start: otherValue, end: value };
    if (nextRange.start > nextRange.end) {
      return;
    }
    if (
      nextRange.start === dateRange.start &&
      nextRange.end === dateRange.end
    ) {
      return;
    }
    onDateRangeChange(nextRange);
  };

  const handlePageSizeChange = (nextValue: string) => {
    const normalized =
      nextValue === "all" ? "all" : Number(nextValue);
    if (normalized === pageSize) {
      return;
    }
    onPageSizeChange(normalized as PageSizeOptionValue);
  };

  const handleFlowChange = (nextValue: FlowFilterValue) => {
    if (nextValue !== flowFilter) {
      onFlowFilterChange(nextValue);
    }
  };

  const handleCategoryChange = (nextValue: string) => {
    if (nextValue !== categoryFilter) {
      onCategoryFilterChange(nextValue);
    }
  };

  const handleSortChange = (nextValue: SortOptionValue) => {
    if (nextValue !== sortOption) {
      onSortOptionChange(nextValue);
    }
  };

  return (
    <form noValidate className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
        <button
          type="button"
          className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 transition hover:text-slate-800"
          onClick={onToggleCollapsed}
          aria-controls={filtersId}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? "Show filters" : "Hide filters"}
        </button>
      </div>
      <div
        id={filtersId}
        aria-hidden={isCollapsed}
        className={filtersGridClassName}
      >
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Account</span>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? selectedAccount}
                onChange={(event) => {
                  field.onChange(event);
                  const nextAccount = event.target.value;
                  if (nextAccount !== selectedAccount) {
                    onAccountChange(nextAccount);
                  }
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">All accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">From</span>
          <Controller
            control={control}
            name="start"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                value={field.value ?? dateRange.start}
                onChange={(event) => {
                  field.onChange(event);
                  handleDateChange("start", event.target.value);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              />
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">To</span>
          <Controller
            control={control}
            name="end"
            render={({ field }) => (
              <input
                {...field}
                type="date"
                value={field.value ?? dateRange.end}
                onChange={(event) => {
                  field.onChange(event);
                  handleDateChange("end", event.target.value);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              />
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Rows</span>
          <Controller
            control={control}
            name="pageSize"
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? String(pageSize)}
                onChange={(event) => {
                  field.onChange(event);
                  handlePageSizeChange(event.target.value);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option value={String(option.value)} key={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Flow</span>
          <Controller
            control={control}
            name="flowFilter"
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? flowFilter}
                onChange={(event) => {
                  field.onChange(event);
                  const nextValue = event.target.value as FlowFilterValue;
                  handleFlowChange(nextValue);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                {FLOW_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Category</span>
          <Controller
            control={control}
            name="categoryFilter"
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? categoryFilter}
                onChange={(event) => {
                  field.onChange(event);
                  handleCategoryChange(event.target.value);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">All categories</option>
                {normalizedCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-slate-500">Sort</span>
          <Controller
            control={control}
            name="sortOption"
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? sortOption}
                onChange={(event) => {
                  field.onChange(event);
                  const nextValue = event.target.value as SortOptionValue;
                  handleSortChange(nextValue);
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </label>
      </div>
      {!isCollapsed && dateError ? (
        <p className="text-[0.6rem] text-rose-600">{dateError}</p>
      ) : null}
    </form>
  );
}

export const FiltersPanel = memo(FiltersPanelComponent);

const normalizePageSize = (
  value: PageSizeOptionValue,
): DashboardFiltersFormValues["pageSize"] =>
  (typeof value === "number" ? String(value) : value) as DashboardFiltersFormValues["pageSize"];
