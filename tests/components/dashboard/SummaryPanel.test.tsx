import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SummaryPanel,
  getLegendCategories,
  getPieCategories,
} from "@/components/dashboard/SummaryPanel";

const trendLinePanelMock = vi.fn();

type TrendLinePanelMockProps = {
  buckets: { date: string; spent: number; income: number }[];
  isLoading: boolean;
  error: string | null;
  dateRange: { start?: string; end?: string };
  flowFilter: string;
  categoryFilters: string[];
};

vi.mock("@/components/dashboard/TrendLinePanel", () => ({
  TrendLinePanel: (props: TrendLinePanelMockProps) => {
    trendLinePanelMock(props);
    return (
      <div
        data-testid="trend-panel"
        data-flow-filter={props.flowFilter}
        data-category-filters={props.categoryFilters.join(",")}
      >
        Trend panel
      </div>
    );
  },
}));

const baseSummaryProps = {
  activeSpentTotal: 300,
  activeIncomeTotal: 450,
  summaryRowsLabel: "4 records",
  summaryErrorText: null,
  dateRange: { start: "2024-05-01", end: "2024-05-31" },
  activeSpendCount: 2,
  activeIncomeCount: 1,
  activeLargestExpense: 120,
  activeLargestIncome: 200,
  categoriesToShow: [
    ["Food", 150],
    ["Rent", 120],
  ],
  categoryEmptyMessage: "No categories",
  trendBuckets: [{ date: "2024-05-01", spent: 80, income: 0 }],
  isLoadingTrend: false,
  trendError: null,
  flowFilter: "spending",
  categoryFilters: ["Food"],
};

describe("getPieCategories", () => {
  it("includes every entry even when there are many categories", () => {
    const categories: [string, number][] = [
      ["Food", 150],
      ["Groceries", 100],
      ["Rent", 80],
      ["Transportation", 60],
      ["Health", 30],
      ["Miscellaneous", 20],
    ];

    expect(getPieCategories(categories)).toEqual(categories);
  });

  it("returns an empty array when no categories are provided", () => {
    expect(getPieCategories([])).toEqual([]);
  });
});

describe("getLegendCategories", () => {
  it("returns every entry when the cap is not reached", () => {
    const categories: [string, number][] = [
      ["Food", 150],
      ["Groceries", 100],
      ["Rent", 80],
    ];

    expect(getLegendCategories(categories, 5)).toEqual(categories);
  });

  it("aggregates the remainder of entries into Other when the cap is exceeded", () => {
    const categories: [string, number][] = [
      ["Food", 150],
      ["Groceries", 100],
      ["Rent", 80],
      ["Transportation", 60],
      ["Health", 30],
      ["Miscellaneous", 20],
    ];

    expect(getLegendCategories(categories)).toEqual([
      ["Food", 150],
      ["Groceries", 100],
      ["Rent", 80],
      ["Transportation", 60],
      ["Other", 50],
    ]);
  });
});

describe("SummaryPanel", () => {
  beforeEach(() => {
    trendLinePanelMock.mockClear();
  });

  it("renders the category chart and trend panel inside the stacked card", () => {
    render(<SummaryPanel {...baseSummaryProps} />);

    expect(screen.getByText(/top categories/i)).toBeDefined();
    expect(screen.getByText(/spending trend/i)).toBeDefined();
    expect(screen.getByText("Food")).toBeDefined();
    expect(screen.getByTestId("trend-panel")).toBeDefined();
  });

  it("forwards filter props and buckets to the trend panel", () => {
    const customBuckets = [
      { date: "2024-05-02", spent: 50, income: 0 },
      { date: "2024-05-03", spent: 30, income: 10 },
    ];

    render(
      <SummaryPanel
        {...baseSummaryProps}
        trendBuckets={customBuckets}
        flowFilter="inflow"
        categoryFilters={["Rent", "Travel"]}
      />,
    );

    const trendPanel = screen.getByTestId("trend-panel");
    expect(trendPanel.dataset.flowFilter).toBe("inflow");
    expect(trendPanel.dataset.categoryFilters).toBe("Rent,Travel");
    expect(trendLinePanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        buckets: customBuckets,
        flowFilter: "inflow",
        categoryFilters: ["Rent", "Travel"],
      }),
    );
  });
});
