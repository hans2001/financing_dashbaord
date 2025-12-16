import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AccountFilterSelect } from "@/components/dashboard/filters/AccountFilterSelect";
import { formatBalanceValue } from "@/components/dashboard/dashboard-utils";

const makeAccount = (id: string, name: string, balance = 1000) => ({
  id,
  name,
  type: "depository",
  institutionName: "Test Bank",
  currentBalance: balance,
});

describe("AccountFilterSelect", () => {
  it("disables the control when no accounts are available", () => {
    const change = vi.fn();

    render(
      <AccountFilterSelect
        accounts={[]}
        selectedAccounts={["all"]}
        onSelectedAccountsChange={change}
      />,
    );

    expect(screen.getByText("No linked accounts")).toBeDefined();
    expect(
      screen.getByRole("button", { name: /toggle account selection/i }),
    ).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: /show all/i })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("renders tags and allows removing an account", () => {
    const change = vi.fn();
    const account = makeAccount("checking", "Checking Account");
    const otherAccount = makeAccount("savings", "Savings Account");

    render(
      <AccountFilterSelect
        accounts={[account, otherAccount]}
        selectedAccounts={[account.id]}
        onSelectedAccountsChange={change}
      />,
    );

    const balanceLabel = formatBalanceValue(account.currentBalance ?? account.availableBalance);
    expect(screen.getByText(balanceLabel)).toBeDefined();
    fireEvent.click(screen.getByLabelText(`Remove ${account.name}`));

    expect(change).toHaveBeenCalledWith(["all"]);
  });

  it("selects individual accounts and exposes the show-all action", () => {
    const change = vi.fn();
    const accounts = [
      makeAccount("checking", "Checking"),
      makeAccount("savings", "Savings"),
    ];

    render(
      <AccountFilterSelect
        accounts={accounts}
        selectedAccounts={["all"]}
        onSelectedAccountsChange={change}
      />,
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle account selection/i,
    });
    fireEvent.click(toggleButton);

    const checkbox = screen.getByTestId("account-checkbox-checking");
    fireEvent.click(checkbox);

    const firstCall = change.mock.calls[0][0];
    expect(firstCall).toHaveLength(1);
    expect(accounts.map((account) => account.id)).toContain(firstCall[0]);

    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(change).toHaveBeenNthCalledWith(2, ["all"]);
  });

  it("shows an overflow indicator when many accounts are selected", () => {
    const change = vi.fn();
    const manyAccounts = Array.from({ length: 6 }, (_, index) =>
      makeAccount(`account-${index}`, `Account ${index + 1}`),
    );

    render(
      <AccountFilterSelect
        accounts={manyAccounts}
        selectedAccounts={manyAccounts.slice(0, 5).map((account) => account.id)}
        onSelectedAccountsChange={change}
      />,
    );

    expect(screen.getByText("+1 more")).toBeDefined();
  });
});
