import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  plaidClientMock,
  prismaMock,
  resetMocks,
} from "./test-utils/mocks";

import { refreshAccountBalances } from "@/lib/account-balances";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/plaid", () => ({
  plaidClient: plaidClientMock,
}));

describe("refreshAccountBalances", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("upserts balances for every Plaid account", async () => {
    plaidClientMock.accountsBalanceGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: "acc-1",
            name: "Primary",
            official_name: "Primary",
            mask: "0001",
            type: "depository",
            subtype: "checking",
            balances: {
              available: 120.34,
              current: 125.78,
              limit: null,
              iso_currency_code: "USD",
              last_updated_datetime: "2025-03-01T12:00:00Z",
            },
          },
        ],
      },
    });

    await refreshAccountBalances({
      bankItemId: "bank-1",
      accessToken: "access-1",
    });

    expect(plaidClientMock.accountsBalanceGet).toHaveBeenCalledWith({
      access_token: "access-1",
    });
    expect(prismaMock.account.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { plaidAccountId: "acc-1" },
        update: expect.objectContaining({
          currentBalance: 125.78,
          availableBalance: 120.34,
          balanceLastUpdated: new Date("2025-03-01T12:00:00Z"),
          currency: "USD",
        }),
        create: expect.objectContaining({
          bankItemId: "bank-1",
        }),
      }),
    );
  });
});
