import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  authorizeRequestMock,
  ensureDemoUserMock,
  plaidClientMock,
  prismaMock,
  refreshAccountBalancesMock,
  resetMocks,
} from "./test-utils/mocks";

import { GET as accountsGET } from "@/app/api/accounts/route";
import { GET as transactionsGET } from "@/app/api/transactions/route";
import { POST as transactionsSyncPOST } from "@/app/api/transactions/sync/route";
import { GET as transactionsSummaryGET } from "@/app/api/transactions/summary/route";
import { PATCH as updateTransactionDescriptionPATCH } from "@/app/api/transactions/[transactionId]/description/route";
import { POST as createLinkTokenPOST } from "@/app/api/plaid/create-link-token/route";
import { POST as exchangePublicTokenPOST } from "@/app/api/plaid/exchange-public-token/route";
import { POST as plaidWebhookPOST } from "@/app/api/plaid/webhook/route";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/family-auth", () => ({
  authorizeRequest: (...args: Parameters<typeof authorizeRequestMock>) =>
    authorizeRequestMock(...args),
  getFamilyHeaderValue: () => "family-dashboard-secret",
}));

vi.mock("@/lib/plaid", () => ({
  plaidClient: plaidClientMock,
}));

vi.mock("@/lib/demo-user", () => ({
  DEMO_USER_ID: "demo-user",
  ensureDemoUser: (...args: Parameters<typeof ensureDemoUserMock>) =>
    ensureDemoUserMock(...args),
}));

vi.mock("@/lib/account-balances", () => ({
  refreshAccountBalances: (...args: Parameters<typeof refreshAccountBalancesMock>) =>
    refreshAccountBalancesMock(...args),
}));

beforeEach(() => {
  resetMocks();
  authorizeRequestMock.mockReturnValue({
    ok: true,
    token: "family-dashboard-secret",
  });
});

describe("accounts endpoint", () => {
  it("returns data when authorized", async () => {
    prismaMock.account.findMany.mockResolvedValue([
      {
        id: "account-1",
        name: "Checking",
        officialName: "Main Checking",
        mask: "0001",
        type: "depository",
        subtype: "checking",
        bankItem: {
          institutionName: "Test Bank",
        },
        currentBalance: new Prisma.Decimal("125.50"),
        availableBalance: new Prisma.Decimal("120.75"),
        creditLimit: new Prisma.Decimal("0"),
        balanceLastUpdated: new Date("2025-03-01T10:15:00Z"),
      },
    ]);

    const response = await accountsGET(
      new Request("http://localhost/api/accounts"),
    );
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.accounts).toEqual([
      {
        id: "account-1",
        name: "Checking",
        officialName: "Main Checking",
        mask: "0001",
        type: "depository",
        subtype: "checking",
        institutionName: "Test Bank",
        currentBalance: 125.5,
        availableBalance: 120.75,
        creditLimit: 0,
        balanceLastUpdated: "2025-03-01T10:15:00.000Z",
      },
    ]);
  });

  it("propagates family auth failures", async () => {
    const denial = NextResponse.json({ error: "blocked" }, { status: 403 });
    authorizeRequestMock.mockReturnValueOnce({ ok: false, response: denial });

    const response = await accountsGET(
      new Request("http://localhost/api/accounts"),
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "blocked" });
  });
});

describe("transactions listing", () => {
  it("fails when requested account is missing", async () => {
    prismaMock.account.findFirst.mockResolvedValue(null);

    const response = await transactionsGET(
      new Request(
        "http://localhost/api/transactions?accountId=missing",
      ),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Account filter not found" });
  });

  it("returns normalized transactions", async () => {
    const mockTransaction = {
      id: "tx-123",
      accountId: "account-1",
      date: new Date("2024-01-02T10:00:00Z"),
      amount: "42.5",
      merchantName: "Corner Cafe",
      description: "Breakfast meetup",
      name: "Corner Cafe",
      category: ["Dining", "Restaurants"],
      pending: false,
      isoCurrencyCode: "USD",
      raw: {
        datetime: "2024-01-02T09:13:45Z",
        location: { city: "City" },
        payment_meta: { by_order_of: "Family" },
      },
      account: {
        name: "Checking",
        bankItem: {
          institutionName: "Test Bank",
        },
      },
    };

    prismaMock.transaction.findMany.mockResolvedValue([mockTransaction]);
    prismaMock.transaction.count.mockResolvedValue(1);

    const response = await transactionsGET(
      new Request("http://localhost/api/transactions?limit=10&offset=0"),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.total).toBe(1);
    expect(payload.transactions[0].categoryPath).toBe("Dining > Restaurants");
    expect(payload.transactions[0].time).toBe("09:13");
    expect(payload.transactions[0].institutionName).toBe("Test Bank");
    expect(payload.transactions[0].description).toBe("Breakfast meetup");
  });

  it("supports sorting and flow filters", async () => {
    prismaMock.transaction.findMany.mockImplementationOnce(async (args) => {
      expect(args?.orderBy).toEqual({ amount: "asc" });
      expect(args?.where?.amount).toEqual({ lt: 0 });
      return [];
    });
    prismaMock.transaction.count.mockImplementationOnce(async (args) => {
      expect(args?.where?.amount).toEqual({ lt: 0 });
      return 0;
    });

    let response = await transactionsGET(
      new Request(
        "http://localhost/api/transactions?flow=spending&sort=amount_desc",
      ),
    );

    expect(response.status).toBe(200);
    let payload = await response.json();
    expect(payload.total).toBe(0);

    prismaMock.transaction.findMany.mockImplementationOnce(async (args) => {
      expect(args?.orderBy).toEqual({ amount: "desc" });
      expect(args?.where?.amount).toEqual({ gt: 0 });
      return [];
    });
    prismaMock.transaction.count.mockImplementationOnce(async (args) => {
      expect(args?.where?.amount).toEqual({ gt: 0 });
      return 0;
    });

    response = await transactionsGET(
      new Request(
        "http://localhost/api/transactions?flow=inflow&sort=amount_desc",
      ),
    );
    expect(response.status).toBe(200);
    payload = await response.json();
    expect(payload.total).toBe(0);
  });

  it("filters by normalized category when provided", async () => {
    prismaMock.transaction.findMany.mockImplementationOnce(async (args) => {
      expect(args?.where?.normalizedCategory).toBe("Food");
      return [];
    });
    prismaMock.transaction.count.mockImplementationOnce(async (args) => {
      expect(args?.where?.normalizedCategory).toBe("Food");
      return 0;
    });

    const response = await transactionsGET(
      new Request("http://localhost/api/transactions?category=Food"),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.total).toBe(0);
  });
});

describe("transactions summary", () => {
  it("aggregates spend and income from paginated batches", async () => {
    const summaryBatch: Array<{
      amount: string;
      category: string[];
    }> = [
      { amount: "-20", category: ["Groceries"] },
      { amount: "150", category: ["Income"] },
      { amount: "-5", category: [] },
    ];

    prismaMock.transaction.findMany
      .mockResolvedValueOnce(summaryBatch)
      .mockResolvedValueOnce([]);

    const response = await transactionsSummaryGET(
      new Request("http://localhost/api/transactions/summary"),
    );

    const payload = await response.json();
    expect(payload.totalSpent).toBe(25);
    expect(payload.totalIncome).toBe(150);
    expect(payload.largestExpense).toBe(20);
    expect(payload.largestIncome).toBe(150);
    expect(payload.spendCount).toBe(2);
    expect(payload.incomeCount).toBe(1);
    expect(payload.categoryTotals).toEqual({
      Groceries: 20,
      Uncategorized: 5,
    });
    expect(payload.incomeCategoryTotals).toEqual({
      Income: 150,
    });
  });

  it("uses normalized categories when available", async () => {
    prismaMock.transaction.findMany
      .mockResolvedValueOnce([
        {
          amount: "-30",
          category: [],
          normalizedCategory: "Food",
          name: "Uber Eats",
          merchantName: "Uber Eats",
        },
        {
          amount: "-70",
          category: [],
          normalizedCategory: "Rent",
          name: "Apartment",
          merchantName: "Apartment",
        },
        {
          amount: "200",
          category: [],
          normalizedCategory: "Business",
          name: "Client Payment",
          merchantName: "Client Payment",
        },
      ])
      .mockResolvedValueOnce([]);

    const response = await transactionsSummaryGET(
      new Request("http://localhost/api/transactions/summary"),
    );

    const payload = await response.json();
    expect(payload.categoryTotals).toEqual({
      Food: 30,
      Rent: 70,
    });
    expect(payload.incomeCategoryTotals).toEqual({
      Business: 200,
    });
  });

  it("applies category filter when provided", async () => {
    prismaMock.transaction.findMany.mockImplementationOnce(async (args) => {
      expect(args?.where?.normalizedCategory).toBe("Rent");
      return [];
    });

    const response = await transactionsSummaryGET(
      new Request("http://localhost/api/transactions/summary?category=Rent"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      totalSpent: 0,
      totalIncome: 0,
      largestExpense: 0,
      largestIncome: 0,
      spendCount: 0,
      incomeCount: 0,
      categoryTotals: {},
      incomeCategoryTotals: {},
    });
  });
});

describe("transactions sync", () => {
  it("fetches plaids transactions, skips existing entries, and reports counters", async () => {
    prismaMock.bankItem.findMany.mockResolvedValue([
      { id: "bank-1", accessToken: "access-1", userId: "demo-user" },
    ]);

    const plaidTransactions = [
      {
        transaction_id: "tx-1",
        account_id: "account-a",
        amount: 20,
        name: "Store",
        merchant_name: "Store",
        category: ["Shopping"],
        pending: false,
        date: "2024-01-01",
      },
      {
        transaction_id: "tx-2",
        account_id: "account-a",
        amount: -15,
        name: "Refund",
        merchant_name: "Refund",
        category: [],
        pending: true,
        date: "2024-01-02",
      },
    ];

    plaidClientMock.transactionsGet.mockResolvedValue({
      data: { transactions: plaidTransactions },
    });

    prismaMock.account.findUnique.mockResolvedValue({
      id: "account-a",
    });

    prismaMock.transaction.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "existing",
      });

    const response = await transactionsSyncPOST(
      new Request("http://localhost/api/transactions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankItemId: "bank-1" }),
      }),
    );

    const payload = await response.json();
    expect(payload).toEqual({ fetched: 2, inserted: 1, updated: 1 });
    expect(prismaMock.transaction.upsert).toHaveBeenCalledTimes(2);
    expect(plaidClientMock.transactionsGet).toHaveBeenCalledWith({
      access_token: "access-1",
      end_date: expect.any(String),
        start_date: expect.any(String),
        options: { count: 500 },
      });
    expect(refreshAccountBalancesMock).toHaveBeenCalledWith({
      bankItemId: "bank-1",
      accessToken: "access-1",
    });
  });

  it("persists normalized categories and flipped amounts", async () => {
    prismaMock.bankItem.findMany.mockResolvedValue([
      { id: "bank-1", accessToken: "access-1", userId: "demo-user" },
    ]);

    const plaidTransactions = [
      {
        transaction_id: "tx-1",
        account_id: "account-a",
        amount: 40,
        name: "Uber Eats",
        merchant_name: "Uber Eats",
        category: ["Food"],
        pending: false,
        date: "2024-01-01",
      },
    ];

    plaidClientMock.transactionsGet.mockResolvedValue({
      data: { transactions: plaidTransactions },
    });

    prismaMock.account.findUnique.mockResolvedValue({
      id: "account-a",
    });
    prismaMock.transaction.findUnique.mockResolvedValue(null);

    const response = await transactionsSyncPOST(
      new Request("http://localhost/api/transactions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankItemId: "bank-1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.transaction.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          normalizedCategory: "Food",
          amount: -40,
        }),
      }),
    );
  });
});

describe("plaid endpoints", () => {
  it("creates a link token after ensuring the demo user", async () => {
    ensureDemoUserMock.mockResolvedValue({ id: "demo-user" });
    plaidClientMock.linkTokenCreate.mockResolvedValue({
      data: { link_token: "token-123" },
    });

    const response = await createLinkTokenPOST();
    expect(await response.json()).toEqual({ link_token: "token-123" });
    expect(ensureDemoUserMock).toHaveBeenCalled();
  });

  it("validates the public token payload", async () => {
    const response = await exchangePublicTokenPOST(
      new Request("http://localhost/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "public_token is required" });
  });

  it("exchanges tokens and upserts accounts", async () => {
    ensureDemoUserMock.mockResolvedValue({ id: "demo-user" });
    plaidClientMock.itemPublicTokenExchange.mockResolvedValue({
      data: { access_token: "access-123", item_id: "item-123" },
    });
    plaidClientMock.itemGet.mockResolvedValue({
      data: { item: { institution_id: "ins-1" } },
    });
    plaidClientMock.institutionsGetById.mockResolvedValue({
      data: { institution: { name: "Test Bank" } },
    });
    plaidClientMock.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: "acc-1",
            name: "Primary",
            official_name: "Primary Account",
            mask: "1111",
            type: "depository",
            subtype: "checking",
            balances: { iso_currency_code: "USD" },
          },
        ],
      },
    });
    prismaMock.bankItem.upsert.mockResolvedValue({ id: "bank-1" });
    prismaMock.account.upsert.mockResolvedValue({});

    const response = await exchangePublicTokenPOST(
      new Request("http://localhost/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: "token" }),
      }),
    );

    expect(await response.json()).toEqual({ status: "ok" });
    expect(prismaMock.bankItem.upsert).toHaveBeenCalled();
    expect(prismaMock.account.upsert).toHaveBeenCalled();
    expect(refreshAccountBalancesMock).toHaveBeenCalledWith({
      bankItemId: "bank-1",
      accessToken: "access-123",
    });
  });

  it("acknowledges webhook payloads", async () => {
    const response = await plaidWebhookPOST(
      new Request("http://localhost/api/plaid/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: true }),
      }),
    );

    expect(await response.json()).toEqual({ received: true });
  });
});
describe("transaction description updates", () => {
  it("validates payload and updates the record", async () => {
    const mockUpdate = {
      id: "tx-123",
      description: "Updated note",
    };
    prismaMock.transaction.update.mockResolvedValue(mockUpdate);

    const response = await updateTransactionDescriptionPATCH(
      new Request("http://localhost/api/transactions/tx-123/description", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Updated note" }),
      }),
      { params: { transactionId: "tx-123" } },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ transaction: mockUpdate });
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: "tx-123" },
      data: { description: "Updated note" },
      select: { id: true, description: true },
    });
  });

  it("trims and clears empty descriptions", async () => {
    prismaMock.transaction.update.mockResolvedValue({
      id: "tx-123",
      description: null,
    });
    const response = await updateTransactionDescriptionPATCH(
      new Request("http://localhost/api/transactions/tx-123/description", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "    " }),
      }),
      { params: { transactionId: "tx-123" } },
    );

    expect(response.status).toBe(200);
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: "tx-123" },
      data: { description: null },
      select: { id: true, description: true },
    });
  });
});
