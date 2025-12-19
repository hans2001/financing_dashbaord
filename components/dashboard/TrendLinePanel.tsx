"use client";

import { forwardRef, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import { DATE_LOCALE, formatCurrency, FLOW_FILTERS } from "./dashboard-utils";
import type { FlowFilterValue } from "./dashboard-utils";
import type { TrendBucket } from "./hooks/useTrendData";

const TREND_COLORS = {
  spending: "#dc2626",
} as const;

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString(DATE_LOCALE, {
    month: "short",
    day: "numeric",
  });

type TrendChartPoint = TrendBucket & { cumulativeSpent: number };

type TrendTooltipProps = TooltipContentProps<
  number | string | ReadonlyArray<number | string>,
  number | string
>;

const TrendTooltip = ({
  active,
  payload,
  label,
}: TrendTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  const bucket = payload[0].payload as TrendChartPoint;
  if (!bucket) {
    return null;
  }
  const labelValue = label ?? bucket.date;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 p-2 text-[0.65rem] text-slate-700 shadow-md shadow-slate-900/10">
      <div className="text-[0.55rem] uppercase tracking-[0.35em] text-slate-500">
        {formatShortDate(String(labelValue))}
      </div>
      <div className="text-sm font-semibold text-slate-900">
        Spent {formatCurrency(bucket.spent)}
      </div>
      <div className="text-[0.6rem] text-slate-400">That day</div>
    </div>
  );
};

const TrendChart = ({ data }: { data: TrendChartPoint[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid
          stroke="#e2e8f0"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tickFormatter={formatShortDate}
          padding={{ left: 0, right: 0 }}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => formatCurrency(value)}
          width={60}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          domain={[0, "dataMax"]}
        />
        <Tooltip
          content={(tooltipProps) => <TrendTooltip {...tooltipProps} />}
          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
        />
        <Line
          type="monotone"
          dataKey="cumulativeSpent"
          stroke={TREND_COLORS.spending}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

type TrendLegendProps = {
  color: string;
  label: string;
  value: number;
};

const TrendLegend = ({ color, label, value }: TrendLegendProps) => (
  <div className="flex items-center gap-2 text-[0.65rem] text-slate-600">
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    <div className="flex flex-col leading-tight">
      <span className="font-semibold text-slate-900">{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  </div>
);

type TrendLinePanelProps = {
  buckets: TrendBucket[];
  isLoading: boolean;
  error: string | null;
  dateRange: { start?: string; end?: string };
  flowFilter: FlowFilterValue;
  categoryFilters: string[];
};

export const TrendLinePanel = forwardRef<HTMLDivElement, TrendLinePanelProps>(
  function TrendLinePanelComponent(
    { buckets, isLoading, error, flowFilter, categoryFilters },
    ref,
  ) {
    const flowLabel =
      FLOW_FILTERS.find((option) => option.value === flowFilter)?.label ??
      "All activity";
    const filterSummary =
      categoryFilters.length > 0
        ? `${categoryFilters.length} categor${categoryFilters.length === 1 ? "y" : "ies"}`
        : "All categories";

    const cumulativeData = useMemo(() => {
      return buckets.reduce<TrendChartPoint[]>((acc, bucket) => {
        const previousBucket = acc[acc.length - 1];
        const previousTotal = previousBucket?.cumulativeSpent ?? 0;
        acc.push({
          ...bucket,
          cumulativeSpent: previousTotal + bucket.spent,
        });
        return acc;
      }, []);
    }, [buckets]);

    if (isLoading) {
      return (
        <div
          ref={ref}
          className="flex h-48 items-center justify-center text-sm text-slate-500"
        >
          Loading trend data…
        </div>
      );
    }

    if (error) {
      return (
        <div
          ref={ref}
          className="flex h-48 flex-col items-center justify-center text-sm text-red-600"
        >
          <p className="font-medium">Failed to load trend data</p>
          <p>{error}</p>
        </div>
      );
    }

    if (buckets.length === 0) {
      return (
        <div
          ref={ref}
          className="flex h-48 flex-col items-center justify-center text-sm text-slate-500"
        >
          <p>No trend data for this date range and filters.</p>
          <p className="text-xs text-slate-400">
            {flowLabel} · {filterSummary}
          </p>
        </div>
      );
    }
    const latestBucket = buckets[buckets.length - 1]!;
    const totalSpent = cumulativeData[cumulativeData.length - 1]?.cumulativeSpent ?? 0;
    return (
      <div ref={ref} className="flex flex-col gap-3 h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50/60 p-2">
          <TrendChart data={cumulativeData} />
        </div>
        <div className="flex flex-wrap gap-3">
          <TrendLegend
            color={TREND_COLORS.spending}
            label="Spent today"
            value={latestBucket?.spent ?? 0}
          />
          <TrendLegend
            color={TREND_COLORS.spending}
            label="Cumulative spent"
            value={totalSpent}
          />
        </div>
      </div>
    );
  },
);

TrendLinePanel.displayName = "TrendLinePanel";
