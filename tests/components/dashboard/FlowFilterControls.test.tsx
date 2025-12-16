import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DEFAULT_FLOW_FILTER } from "@/components/dashboard/dashboard-utils";
import { FlowFilterControls } from "@/components/dashboard/filters/FlowFilterControls";

describe("FlowFilterControls", () => {
  it("calls handler when a new flow option is selected", () => {
    const flowChange = vi.fn();
    render(
      <FlowFilterControls
        flowFilter={DEFAULT_FLOW_FILTER}
        onFlowFilterChange={flowChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Spending only" }));
    expect(flowChange).toHaveBeenCalledWith("spending");
  });
});
