import { memo, useEffect, useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

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

const FILTERS_ROW_CLASSES =
  "flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-thin";
const FIELD_WRAPPER_CLASSES =
  "flex min-w-[7rem] flex-1 flex-shrink-0 flex-col gap-1 text-[0.55rem]";
const FIELD_LABEL_CLASSES =
  "text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-500";
const FIELD_CONTROL_CLASSES =
  "h-7 w-full rounded-sm border border-slate-200 bg-white px-1.5 text-[0.65rem] text-slate-700 outline-none focus:border-slate-400 transition";
const PRIMARY_FIELD_COL_SPAN = "min-w-[130px]";
const DATE_FIELD_COL_SPAN = "min-w-[150px]";

function FiltersPanelComponent({
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
      start: dateRange.start,
      end: dateRange.end,
      pageSize: normalizePageSize(pageSize),
      flowFilter,
      categoryFilter,
      sortOption,
    });
  }, [
    reset,
    dateRange.start,
    dateRange.end,
    pageSize,
    flowFilter,
    categoryFilter,
    sortOption,
  ]);

  const dateError = errors.start?.message ?? errors.end?.message;

  const filtersId = useId();
  const filtersSectionClassName = [
    "flex flex-col gap-2",
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
    <form noValidate className="flex flex-col gap-2 text-[0.65rem]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
        <button
          type="button"
          className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-500 transition hover:text-slate-800"
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
        className={filtersSectionClassName}
      >
        <div className={FILTERS_ROW_CLASSES}>
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>From</span>
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
                  className={FIELD_CONTROL_CLASSES}
                />
              )}
            />
          </label>
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>To</span>
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
                  className={FIELD_CONTROL_CLASSES}
                />
              )}
            />
          </label>
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${PRIMARY_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>Flow</span>
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
                  className={FIELD_CONTROL_CLASSES}
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
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${PRIMARY_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>Category</span>
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
                  className={FIELD_CONTROL_CLASSES}
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
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${PRIMARY_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>Sort</span>
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
                  className={FIELD_CONTROL_CLASSES}
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
          <label
            className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}
          >
            <span className={FIELD_LABEL_CLASSES}>Rows</span>
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
                  className={FIELD_CONTROL_CLASSES}
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
        </div>
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
