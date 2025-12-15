import {
  DEFAULT_PAGE_SIZE_OPTION,
  PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTION,
  SORT_OPTIONS,
} from "../dashboard-utils";
import type { PageSizeOptionValue, SortOptionValue } from "../dashboard-utils";

type FilterChipsProps = {
  categoryFilter: string;
  handleCategoryChange: (value: string) => void;
  sortOption: SortOptionValue;
  handleSortChange: (value: SortOptionValue) => void;
  pageSize: PageSizeOptionValue;
  handlePageSizeChange: (value: PageSizeOptionValue) => void;
  defaultCategories?: string[];
};

type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export function FilterChips({
  categoryFilter,
  handleCategoryChange,
  sortOption,
  handleSortChange,
  pageSize,
  handlePageSizeChange,
  defaultCategories = [],
}: FilterChipsProps) {
  const chips: FilterChip[] = [];

  const normalizedDefaultCategories = defaultCategories.filter(Boolean);
  const visibleDefaultCategories = normalizedDefaultCategories.slice(0, 3);
  const extraDefaultCategories = Math.max(
    normalizedDefaultCategories.length - visibleDefaultCategories.length,
    0,
  );
  const defaultCategoriesLabel =
    visibleDefaultCategories.length > 0
      ? `Default categories: ${visibleDefaultCategories.join(", ")}${
          extraDefaultCategories > 0 ? ` +${extraDefaultCategories} more` : ""
        }`
      : null;

  if (categoryFilter && categoryFilter !== "all") {
    chips.push({
      key: "category",
      label: `Category: ${categoryFilter}`,
      onRemove: () => handleCategoryChange("all"),
    });
  }

  const sortOptionData = SORT_OPTIONS.find((option) => option.value === sortOption);
  if (sortOption !== DEFAULT_SORT_OPTION && sortOptionData) {
    chips.push({
      key: "sort",
      label: `Sort: ${sortOptionData.label}`,
      onRemove: () => handleSortChange(DEFAULT_SORT_OPTION),
    });
  }

  const pageSizeOption = PAGE_SIZE_OPTIONS.find((option) => option.value === pageSize);
  if (pageSize !== DEFAULT_PAGE_SIZE_OPTION && pageSizeOption) {
    chips.push({
      key: "pageSize",
      label: `Rows: ${pageSizeOption.label}`,
      onRemove: () => handlePageSizeChange(DEFAULT_PAGE_SIZE_OPTION),
    });
  }

  const chipContent =
    chips.length === 0 ? (
      defaultCategoriesLabel ? (
        <span className="text-[0.65rem] text-slate-400">
          {defaultCategoriesLabel}
        </span>
      ) : (
        <span className="text-[0.65rem] text-slate-400">
          No additional filters
        </span>
      )
    ) : (
      chips.map((chip) => (
        <div
          key={chip.key}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] text-slate-700"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            aria-label={`Remove ${chip.label}`}
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-800"
            onClick={chip.onRemove}
          >
            ×
          </button>
        </div>
      ))
    );

  return <div className="flex flex-wrap items-center gap-1">{chipContent}</div>;
}
