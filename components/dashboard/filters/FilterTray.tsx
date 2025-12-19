'use client';

import { Controller, type Control } from "react-hook-form";

import { PAGE_SIZE_OPTIONS, SORT_OPTIONS } from "../dashboard-utils";
import type { PageSizeOptionValue, SortOptionValue } from "../dashboard-utils";
import type { DashboardFiltersFormValues } from "../forms/dashboardFiltersForm";
import { CategorySelector } from "./CategorySelector";
type FilterTrayProps = {
  control: Control<DashboardFiltersFormValues>;
  dateRange: { start: string; end: string };
  pageSize: PageSizeOptionValue;
  sortOption: SortOptionValue;
  handleDateChange: (field: "start" | "end", value: string) => void;
  handlePageSizeChange: (value: string) => void;
  categoryFilters: string[];
  handleCategoryFiltersChange: (value: string[]) => void;
  handleSortChange: (value: SortOptionValue) => void;
  dateError: string | undefined;
  categoryOptions: string[];
  isCategoryLoading: boolean;
};

const FILTERS_ROW_CLASSES =
  "flex flex-nowrap gap-1 overflow-x-auto pb-1 scrollbar-thin";
const FIELD_WRAPPER_CLASSES =
  "flex min-w-[7rem] flex-1 flex-shrink-0 flex-col gap-1 text-[0.55rem]";
const FIELD_LABEL_CLASSES =
  "text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-500";
const FIELD_CONTROL_CLASSES =
  "h-7 w-full rounded-sm border border-slate-200 bg-white px-1.5 text-[0.65rem] text-slate-700 outline-none focus:border-slate-400 transition";
const PRIMARY_FIELD_COL_SPAN = "min-w-[130px]";
const DATE_FIELD_COL_SPAN = "min-w-[150px]";

export function FilterTray({
  control,
  dateRange,
  pageSize,
  sortOption,
  handleDateChange,
  handlePageSizeChange,
  categoryFilters,
  handleCategoryFiltersChange,
  handleSortChange,
  categoryOptions,
  isCategoryLoading,
  dateError,
}: FilterTrayProps) {
  return (
    <form noValidate className="flex flex-col gap-2 text-[0.65rem]">
      <div className={FILTERS_ROW_CLASSES}>
        <label className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}>
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
        <label className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}>
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
        <label className={`${FIELD_WRAPPER_CLASSES} ${PRIMARY_FIELD_COL_SPAN}`}>
          <span className={FIELD_LABEL_CLASSES}>Category</span>
          <CategorySelector
            categories={categoryOptions}
            selectedCategories={categoryFilters}
            onChange={handleCategoryFiltersChange}
            isLoading={isCategoryLoading}
          />
        </label>
        <label className={`${FIELD_WRAPPER_CLASSES} ${PRIMARY_FIELD_COL_SPAN}`}>
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
                  handleSortChange(event.target.value as SortOptionValue);
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
        <label className={`${FIELD_WRAPPER_CLASSES} ${DATE_FIELD_COL_SPAN}`}>
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
      {dateError ? (
        <p className="text-[0.6rem] text-rose-600">{dateError}</p>
      ) : null}
    </form>
  );
}
