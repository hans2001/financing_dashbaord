import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { LinkedAccountsPanel } from "@/components/dashboard/LinkedAccountsPanel";

const baseAccount = {
  id: "acc-1",
  name: "Family Checking",
  officialName: "Family Checking",
  mask: "0001",
  type: "depository",
  subtype: "checking",
  institutionName: "Plaid Bank",
  currentBalance: 5400.34,
  availableBalance: 5250.1,
  creditLimit: null,
  balanceLastUpdated: "2025-03-01T12:00:00Z",
  isBalanceStale: true,
};

describe("LinkedAccountsPanel", () => {
  it("renders balances, fallbacks, and stale refresh controls", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <LinkedAccountsPanel
        accounts={[
          baseAccount,
          {
            ...baseAccount,
            id: "acc-2",
            name: "Rewards Card",
            type: "credit",
            availableBalance: null,
            currentBalance: -1200,
            creditLimit: 5000,
            balanceLastUpdated: "2025-03-02T15:45:00Z",
            isBalanceStale: false,
          },
        ]}
        isLoading={false}
        error={null}
        showAll
        onToggleShow={() => {}}
        onRefresh={onRefresh}
        isSyncing={false}
      />,
    );

    expect(screen.getAllByTestId("account-row")).toHaveLength(2);
    expect(screen.getByText("Stale").textContent).toBe("Stale");
    expect(screen.getByText("Balance older than 24h").textContent).toBe(
      "Balance older than 24h",
    );
    expect(screen.getByText("Current · $5,400.34").textContent).toBe("Current · $5,400.34");
    expect(screen.getByText("Limit · $5,000.00").textContent).toBe(
      "Limit · $5,000.00",
    );

    fireEvent.click(screen.getByText("Refresh"));
    expect(onRefresh).toHaveBeenCalled();
  });

  it("shows +N more label when collapsed", () => {
    const accounts = Array.from({ length: 6 }, (_, index) => ({
      ...baseAccount,
      id: `acc-${index}`,
      name: `Account ${index}`,
      isBalanceStale: false,
    }));

    render(
      <LinkedAccountsPanel
        accounts={accounts}
        isLoading={false}
        error={null}
        showAll={false}
        onToggleShow={() => {}}
        onRefresh={vi.fn()}
        isSyncing={false}
      />,
    );

    expect(screen.getAllByTestId("account-row")).toHaveLength(4);
    expect(screen.getByText("+2 more").textContent).toBe("+2 more");
  });

  it("hides duplicate current balance when equal to available", () => {
    render(
      <LinkedAccountsPanel
        accounts={[
          {
            ...baseAccount,
            availableBalance: baseAccount.currentBalance,
            isBalanceStale: false,
          },
        ]}
        isLoading={false}
        error={null}
        showAll
        onToggleShow={() => {}}
        onRefresh={vi.fn()}
        isSyncing={false}
      />,
    );

    expect(screen.queryByText(/Current ·/i)).toBeNull();
    expect(screen.getByText("$5,400.34").textContent).toBe("$5,400.34");
  });
});
