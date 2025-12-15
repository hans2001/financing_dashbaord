'use client'

import { memo, useEffect, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as Collapsible from "@radix-ui/react-collapsible";

import { FilterChips } from "./filters/FilterChips";
import { FilterSummary } from "./filters/FilterSummary";
import { FilterTray } from "./filters/FilterTray";
import {
  DEFAULT_PAGE_SIZE_OPTION,
  DEFAULT_SORT_OPTION,
} from "./dashboard-utils";
import type { PageSizeOptionValue, SortOptionValue } from "./dashboard-utils";
import {
  dashboardFiltersResolver,
  DashboardFiltersFormValues,
  isIsoDateString,
} from "./forms/dashboardFiltersForm";

type FiltersPanelProps = {
  dateRange: { start: string; end: string };
  onDateRangeChange: (next: { start: string; end: string }) => void;
  pageSize: PageSizeOptionValue;
  onPageSizeChange: (value: PageSizeOptionValue) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: string[];
  sortOption: SortOptionValue;
  onSortOptionChange: (value: SortOptionValue) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isSyncing: boolean;
  onSync: () => void;
};

function FiltersPanelComponent({
  dateRange,
  onDateRangeChange,
  pageSize,
  onPageSizeChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  sortOption,
  onSortOptionChange,
  isCollapsed,
  onToggleCollapsed,
  isSyncing,
  onSync,
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
      categoryFilter,
      sortOption,
    });
  }, [
    reset,
    dateRange.start,
    dateRange.end,
    pageSize,
    categoryFilter,
    sortOption,
  ]);

  const dateError = errors.start?.message ?? errors.end?.message;
  const detailTrayId = useId();

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

  const handlePageSizeChange = (
    nextValue: PageSizeOptionValue | string,
  ) => {
    const normalized =
      nextValue === "all"
        ? "all"
        : typeof nextValue === "number"
        ? nextValue
        : Number(nextValue);
    if (typeof normalized === "number" && Number.isNaN(normalized)) {
      return;
    }
    if (normalized === pageSize) {
      return;
    }
    onPageSizeChange(normalized as PageSizeOptionValue);
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

  const hasCategoryFilter =
    Boolean(categoryFilter && categoryFilter !== "all");
  const hasSortFilter = sortOption !== DEFAULT_SORT_OPTION;
  const hasPageSizeFilter = pageSize !== DEFAULT_PAGE_SIZE_OPTION;
  const hasActiveFilters =
    hasCategoryFilter || hasSortFilter || hasPageSizeFilter;

  const handleClearFilters = () => {
    handleCategoryChange("all");
    handleSortChange(DEFAULT_SORT_OPTION);
    handlePageSizeChange(DEFAULT_PAGE_SIZE_OPTION);
  };

  const summaryCardClasses =
    "rounded-xl border border-slate-200 bg-white px-3 py-0 shadow-sm shadow-slate-900/5";
  const detailContentClasses = [
    "overflow-hidden transition-[max-height,opacity] duration-150 ease-in-out",
    isCollapsed
      ? "max-h-0 opacity-0 pointer-events-none"
      : "max-h-[32rem] opacity-100 pointer-events-auto",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="flex flex-col gap-2">
      <div className={`${summaryCardClasses} flex flex-col gap-0`}>
        <FilterSummary
          dateRange={dateRange}
          isCollapsed={isCollapsed}
          onToggleCollapsed={onToggleCollapsed}
          detailTrayId={detailTrayId}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-0 py-2">
          <div className="flex-1">
            <FilterChips
              categoryFilter={categoryFilter}
              handleCategoryChange={handleCategoryChange}
              sortOption={sortOption}
              handleSortChange={handleSortChange}
              pageSize={pageSize}
              handlePageSizeChange={handlePageSizeChange}
              defaultCategories={categoryOptions}
            />
          </div>
          <button
            type="button"
            className="rounded-full border border-transparent bg-gradient-to-br from-slate-900 to-slate-700 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-slate-900/30 transition hover:from-slate-800 hover:to-slate-600 disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
            onClick={onSync}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>
      <Collapsible.Root open={!isCollapsed}>
        <Collapsible.Content
          id={detailTrayId}
          className={detailContentClasses}
          aria-hidden={isCollapsed}
        >
          <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm shadow-slate-900/5">
            <FilterTray
              control={control}
              dateRange={dateRange}
              pageSize={pageSize}
              categoryFilter={categoryFilter}
              sortOption={sortOption}
              normalizedCategoryOptions={normalizedCategoryOptions}
              handleDateChange={handleDateChange}
              handlePageSizeChange={handlePageSizeChange}
              handleCategoryChange={handleCategoryChange}
              handleSortChange={handleSortChange}
              dateError={dateError}
            />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </section>
  );
}

export const FiltersPanel = memo(FiltersPanelComponent);

const normalizePageSize = (
  value: PageSizeOptionValue,
): DashboardFiltersFormValues["pageSize"] =>
  (typeof value === "number" ? String(value) : value) as DashboardFiltersFormValues["pageSize"];
