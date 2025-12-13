import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDashboardFilters } from "@/components/dashboard/hooks/useDashboardFilters";

describe("useDashboardFilters", () => {
  it("resets pagination when the selected account changes", () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setSelectedAccounts(["checking-account"]);
    });

    expect(result.current.currentPage).toBe(0);
    expect(result.current.selectedAccounts).toEqual(["checking-account"]);
  });

  it("resets pagination when the date range updates", () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setDateRange(() => ({
        start: "2024-01-01",
        end: "2024-01-31",
      }));
    });

    expect(result.current.currentPage).toBe(0);
    expect(result.current.dateRange).toEqual({
      start: "2024-01-01",
      end: "2024-01-31",
    });
  });

  it("toggles showing all rows when page size switches between numeric and 'all'", () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setPageSize(25);
    });
    expect(result.current.isShowingAllRows).toBe(false);

    act(() => {
      result.current.setPageSize("all");
    });

    expect(result.current.isShowingAllRows).toBe(true);
    expect(result.current.numericPageSize).toBeGreaterThan(0);
  });

  it("resets pagination when category filter changes", () => {
    const { result } = renderHook(() => useDashboardFilters());

    act(() => {
      result.current.setCurrentPage(4);
    });
    expect(result.current.currentPage).toBe(4);

    act(() => {
      result.current.setCategoryFilter("Food");
    });

    expect(result.current.currentPage).toBe(0);
    expect(result.current.categoryFilter).toBe("Food");
  });
});
