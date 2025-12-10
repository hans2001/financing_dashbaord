import { memo } from "react";
import { CATEGORY_PIE_COLORS, MAX_CATEGORY_SLICES, formatCurrency } from "./dashboard-utils";

type SummaryPanelProps = {
  activeSpentTotal: number;
  activeIncomeTotal: number;
  summaryRowsLabel: string;
  summaryErrorText: string | null;
  dateRange: { start?: string; end?: string };
  activeSpendCount: number;
  activeIncomeCount: number;
  activeLargestExpense: number;
  activeLargestIncome: number;
  categoriesToShow: [string, number][];
  categoryEmptyMessage: string;
};

type PieSegment = {
  label: string;
  value: number;
  percent: number;
  start: number;
  end: number;
  color: string;
};

type CategoryPieProps = {
  categoriesToShow: [string, number][];
  categoryEmptyMessage: string;
};

const CategoryPie = ({ categoriesToShow, categoryEmptyMessage }: CategoryPieProps) => {
  const base = categoriesToShow.slice(0, MAX_CATEGORY_SLICES);
  const overflow = categoriesToShow.slice(MAX_CATEGORY_SLICES);
  const remainderTotal = overflow.reduce<number>(
    (sum, [, value]) => sum + value,
    0,
  );
  const pieCategories: [string, number][] =
    remainderTotal > 0 ? [...base, ["Other", remainderTotal]] : base;
  const total =
    pieCategories.reduce<number>((sum, [, value]) => sum + value, 0) || 1;

  const segments: PieSegment[] = [];
  let offset = 0;
  pieCategories.forEach(([label, value], index) => {
    const percent = value / total;
    const start = offset;
    const end = start + percent * 100;
    offset = end;
    const color =
      CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length] ?? "#0f5ef2";
    segments.push({
      label,
      value,
      percent,
      start,
      end,
      color,
    });
  });

  return categoriesToShow.length === 0 ? (
    <p className="mt-2 text-sm text-slate-500">{categoryEmptyMessage}</p>
  ) : (
    <div className="mt-3 flex flex-col items-center gap-3 text-center">
      <div className="relative h-36 w-36">
        <div
          className="h-full w-full rounded-full"
          style={{
            backgroundImage: `conic-gradient(${segments
              .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
              .join(", ")})`,
          }}
        />
        <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-[0.55rem] uppercase tracking-[0.2em] text-slate-400">
            Total
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(pieCategories.reduce((sum, [, value]) => sum + value, 0))}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-sm text-slate-600 md:flex-row md:flex-wrap md:items-center md:gap-3">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex w-full max-w-sm items-center justify-between gap-2 md:w-auto md:flex-1"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-slate-900">{segment.label}</span>
            </div>
            <span className="text-xs text-slate-500">
              {Math.round(segment.percent * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function SummaryPanelComponent({
  activeSpentTotal,
  activeIncomeTotal,
  summaryRowsLabel,
  summaryErrorText,
  dateRange,
  activeSpendCount,
  activeIncomeCount,
  activeLargestExpense,
  activeLargestIncome,
  categoriesToShow,
  categoryEmptyMessage,
}: SummaryPanelProps) {
  return (
    <div className="sticky top-6 flex max-h-[calc(100vh-200px)] min-w-0 flex-[0.15] flex-col gap-3 xl:min-w-[280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
        <div className="pb-2">
          <p className="text-[0.5rem] uppercase tracking-[0.3em] text-slate-400">
            Spending summary
          </p>
          <p className="text-base font-semibold text-slate-900">
            {formatCurrency(activeSpentTotal)}
          </p>
          <p className="text-xs text-slate-500">{summaryRowsLabel}</p>
          {summaryErrorText && (
            <p className="text-[0.6rem] text-red-600">{summaryErrorText}</p>
          )}
          <p className="text-[0.6rem] text-slate-400">
            {dateRange.start || "—"} → {dateRange.end || "—"}
          </p>
        </div>
        <dl className="divide-y divide-slate-100 text-[0.75rem] text-slate-600">
          {[
            {
              label: "Net cashflow",
              value: activeIncomeTotal - activeSpentTotal,
              tone: "text-slate-900",
            },
            {
              label: "Total inflow",
              value: activeIncomeTotal,
              tone: "text-emerald-600",
            },
            {
              label: "Total spent",
              value: activeSpentTotal,
              tone: "text-red-600",
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1">
              <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
                {row.label}
              </dt>
              <dd className={`font-semibold ${row.tone}`}>
                {formatCurrency(row.value)}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between py-1">
            <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
              Transactions
            </dt>
            <dd className="text-[0.7rem] font-semibold text-slate-900">
              {activeSpendCount} spend · {activeIncomeCount} inflow
            </dd>
          </div>
          <div className="flex items-center justify-between py-1">
            <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
              Largest expense
            </dt>
            <dd className="text-[0.7rem] font-semibold text-red-600">
              {activeLargestExpense > 0
                ? formatCurrency(-activeLargestExpense)
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between py-1">
            <dt className="text-[0.6rem] uppercase tracking-[0.25em]">
              Largest inflow
            </dt>
            <dd className="text-[0.7rem] font-semibold text-emerald-600">
              {activeLargestIncome > 0 ? formatCurrency(activeLargestIncome) : "—"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
        <p className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
          Top categories
        </p>
        <CategoryPie
          categoriesToShow={categoriesToShow}
          categoryEmptyMessage={categoryEmptyMessage}
        />
      </div>
    </div>
  );
}

export const SummaryPanel = memo(SummaryPanelComponent);
