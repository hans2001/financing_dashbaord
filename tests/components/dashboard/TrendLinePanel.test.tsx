import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { FlowFilterValue, formatCurrency } from "@/components/dashboard/dashboard-utils";
import type { TrendBucket } from "@/components/dashboard/hooks/useTrendData";
import { TrendLinePanel } from "@/components/dashboard/TrendLinePanel";

vi.mock("recharts", () => {
  const MockContainer = ({ children }: { children?: ReactNode }) => (
    <div data-testid="mock-responsive">{children}</div>
  );
  const MockChart = ({ children }: { children?: ReactNode }) => (
    <svg data-testid="mock-line-chart">{children}</svg>
  );

  return {
    Area: () => null,
    CartesianGrid: () => null,
    Line: () => null,
    LineChart: MockChart,
    ReferenceDot: () => null,
    ResponsiveContainer: MockContainer,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  };
});

const baseProps = {
  buckets: [] as TrendBucket[],
  isLoading: false,
  error: null,
  dateRange: { start: "2024-05-01", end: "2024-05-07" },
  flowFilter: "all" as FlowFilterValue,
  categoryFilters: [],
};

describe("TrendLinePanel", () => {
  it("shows a loading placeholder when the data is still fetching", () => {
    render(<TrendLinePanel {...baseProps} isLoading />);

    expect(screen.getByText(/loading trend data…/i)).toBeDefined();
  });

  it("emits the error state when the fetch fails", () => {
    render(<TrendLinePanel {...baseProps} error="boom" />);

    expect(screen.getByText(/failed to load trend data/i)).toBeDefined();
    expect(screen.getByText(/boom/i)).toBeDefined();
  });

  it("renders the empty message when no buckets exist", () => {
    render(<TrendLinePanel {...baseProps} />);

    expect(
      screen.getByText(/no trend data for this date range and filters/i),
    ).toBeDefined();
    expect(screen.getByText(/all activity · all categories/i)).toBeDefined();
  });

  it("renders the legend totals from the latest buckets", () => {
    const buckets: TrendBucket[] = [
      { date: "2024-05-01", spent: 120, income: 50 },
      { date: "2024-05-02", spent: 75, income: 0 },
      { date: "2024-05-03", spent: 30, income: 10 },
    ];
    const expectedTotal = buckets.reduce((sum, bucket) => sum + bucket.spent, 0);

    render(
      <TrendLinePanel
        {...baseProps}
        buckets={buckets}
        isLoading={false}
        error={null}
        categoryFilters={["Food"]}
      />,
    );

    expect(screen.getByText(/cumulative spent/i)).toBeDefined();
    expect(screen.getByText(formatCurrency(expectedTotal))).toBeDefined();
  });
});
