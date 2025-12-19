import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CategorySelector } from "@/components/dashboard/filters/CategorySelector";

describe("CategorySelector", () => {
  it("shows a loading state while categories resolve", () => {
    render(
      <CategorySelector
        categories={[]}
        selectedCategories={[]}
        onChange={vi.fn()}
        isLoading
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /all categories/i }));

    expect(screen.getByText("Loading categories…")).toBeDefined();
  });

  it("renders every category with checkboxes and toggles selection", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CategorySelector
        categories={["Food", "Rent"]}
        selectedCategories={["Rent"]}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /1 selected/i });
    expect(trigger).toBeDefined();

    fireEvent.click(trigger);

    const foodCheckbox = screen.getByRole("checkbox", { name: "Filter by Food" });
    const rentCheckbox = screen.getByRole("checkbox", { name: "Filter by Rent" });

    expect(rentCheckbox.getAttribute("data-state")).toBe("checked");
    expect(foodCheckbox.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(foodCheckbox);
    expect(onChange).toHaveBeenCalledWith(["Rent", "Food"]);

    rerender(
      <CategorySelector
        categories={["Food", "Rent"]}
        selectedCategories={["Rent", "Food"]}
        onChange={onChange}
      />,
    );

    const updatedRentCheckbox = screen.getByRole("checkbox", {
      name: "Filter by Rent",
    });
    fireEvent.click(updatedRentCheckbox);
    expect(onChange).toHaveBeenCalledWith(["Food"]);
  });

  it("clears the selection when requested", () => {
    const onChange = vi.fn();

    render(
      <CategorySelector
        categories={["Food"]}
        selectedCategories={["Food"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /1 selected/i }));
    const clearButton = screen.getByRole("button", { name: /clear/i });

    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
