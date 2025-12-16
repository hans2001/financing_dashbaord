import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  DEFAULT_FLOW_FILTER,
  DEFAULT_PAGE_SIZE_OPTION,
  PAGE_SIZE_OPTIONS,
} from "@/components/dashboard/dashboard-utils";
import { FilterChips } from "@/components/dashboard/filters/FilterChips";

describe("FilterChips", () => {
  it("shows placeholder text when defaults are in place", () => {
    const categoryChange = vi.fn();
    const sortChange = vi.fn();
    const pageSizeChange = vi.fn();
    const flowChange = vi.fn();

    render(
      <FilterChips
        categoryFilter="all"
        handleCategoryChange={categoryChange}
        sortOption="date_desc"
        handleSortChange={sortChange}
        pageSize={DEFAULT_PAGE_SIZE_OPTION}
        handlePageSizeChange={pageSizeChange}
        flowFilter={DEFAULT_FLOW_FILTER}
        handleFlowFilterChange={flowChange}
      />,
    );

    expect(screen.getByText("No additional filters")).toBeDefined();
  });

  it("renders chips for active filters and allows removing them", () => {
    const categoryChange = vi.fn();
    const sortChange = vi.fn();
    const pageSizeChange = vi.fn();
    const flowChange = vi.fn();

    const customPageSizeOption = PAGE_SIZE_OPTIONS.find(
      (option) => option.value !== DEFAULT_PAGE_SIZE_OPTION,
    );
    if (!customPageSizeOption) {
      throw new Error("No non-default page size option available");
    }

    render(
      <FilterChips
        categoryFilter="Groceries"
        handleCategoryChange={categoryChange}
        sortOption="amount_desc"
        handleSortChange={sortChange}
        pageSize={customPageSizeOption.value}
        handlePageSizeChange={pageSizeChange}
        flowFilter="spending"
        handleFlowFilterChange={flowChange}
      />,
    );

    expect(screen.getByText("Category: Groceries")).toBeDefined();
    expect(screen.getByText("Sort: Amount (high → low)")).toBeDefined();
    expect(
      screen.getByText(`Rows: ${customPageSizeOption.label}`),
    ).toBeDefined();
    expect(screen.getByText("Flow: Spending only")).toBeDefined();

    fireEvent.click(screen.getByLabelText("Remove Category: Groceries"));
    expect(categoryChange).toHaveBeenCalledWith("all");
    fireEvent.click(screen.getByLabelText("Remove Sort: Amount (high → low)"));
    expect(sortChange).toHaveBeenCalledWith("date_desc");
    fireEvent.click(
      screen.getByLabelText(`Remove Rows: ${customPageSizeOption.label}`),
    );
    expect(pageSizeChange).toHaveBeenCalledWith(DEFAULT_PAGE_SIZE_OPTION);
    fireEvent.click(screen.getByLabelText("Remove Flow: Spending only"));
    expect(flowChange).toHaveBeenCalledWith(DEFAULT_FLOW_FILTER);
  });
});
