import { useMemo } from "react";

type FilterSummaryProps = {
  dateRange: { start: string; end: string };
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  detailTrayId: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

const formatDateRangeLabel = (range: FilterSummaryProps["dateRange"]) => {
  const toLabel = (value: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const startLabel = toLabel(range.start);
  const endLabel = toLabel(range.end);

  return `${startLabel} – ${endLabel}`;
};

export function FilterSummary({
  dateRange,
  isCollapsed,
  onToggleCollapsed,
  detailTrayId,
  hasActiveFilters,
  onClearFilters,
}: FilterSummaryProps) {
  const dateLabel = useMemo(() => formatDateRangeLabel(dateRange), [dateRange]);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-3 py-0.5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-900/5">
        {dateLabel}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear all
        </button>
        <button
          type="button"
          className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:text-slate-900"
          onClick={onToggleCollapsed}
          aria-controls={detailTrayId}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? "Show filters" : "Hide filters"}
        </button>
      </div>
    </div>
  );
}
