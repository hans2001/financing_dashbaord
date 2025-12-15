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
    <div className="flex items-start justify-between gap-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {dateLabel}
      </p>
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
          className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-500 transition hover:text-slate-800"
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
