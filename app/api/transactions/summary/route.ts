import { NextResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/family-auth";
import type { Prisma } from "@prisma/client";

type TransactionWhereInput = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>["where"];

const decimalToNumber = (value?: Prisma.Decimal | null) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
};

type SummaryResponse = {
  totalSpent: number;
  totalIncome: number;
  largestExpense: number;
  largestIncome: number;
  spendCount: number;
  incomeCount: number;
  categoryTotals: Record<string, number>;
  incomeCategoryTotals: Record<string, number>;
};

export async function GET(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const accountIds = url
      .searchParams.getAll("accountId")
      .filter(Boolean);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const categoryParams = url
      .searchParams
      .getAll("category")
      .map((value) => value?.trim())
      .filter(Boolean);
    const where: TransactionWhereInput = {
      account: {
        bankItem: {
          userId: DEMO_USER_ID,
        },
      },
    };

    const filteredAccountIds = accountIds.filter((id) => id !== "all");
    if (filteredAccountIds.length > 0) {
      const uniqueAccountIds = Array.from(new Set(filteredAccountIds));
      const validatedAccounts = await prisma.account.findMany({
        where: {
          id: {
            in: uniqueAccountIds,
          },
          bankItem: {
            userId: DEMO_USER_ID,
          },
        },
        select: {
          id: true,
        },
      });
      if (validatedAccounts.length !== uniqueAccountIds.length) {
        return NextResponse.json(
          { error: "Account filter not found" },
          { status: 400 },
        );
      }
      where.accountId = {
        in: uniqueAccountIds,
      };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const normalizedCategoryFilters = Array.from(
      new Set(
        categoryParams.filter((value) => value !== "all"),
      ),
    );
    if (normalizedCategoryFilters.length > 0) {
      where.normalizedCategory = {
        in: normalizedCategoryFilters,
      };
    }

    const spendWhere: TransactionWhereInput = {
      ...where,
      amount: { lt: 0 },
    };
    const incomeWhere: TransactionWhereInput = {
      ...where,
      amount: { gt: 0 },
    };

    const [
      spendAggregate,
      incomeAggregate,
      spendCategoryGroups,
      incomeCategoryGroups,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: spendWhere,
        _sum: { amount: true },
        _min: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.aggregate({
        where: incomeWhere,
        _sum: { amount: true },
        _max: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.groupBy({
        where: spendWhere,
        by: ["normalizedCategory"],
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        where: incomeWhere,
        by: ["normalizedCategory"],
        _sum: { amount: true },
      }),
    ]);

    const categoryTotals = spendCategoryGroups.reduce<Record<string, number>>(
      (collector, group) => {
        const label = group.normalizedCategory ?? "Uncategorized";
        const sum = Math.abs(decimalToNumber(group._sum.amount));
        if (sum === 0) {
          return collector;
        }
        collector[label] = sum;
        return collector;
      },
      {},
    );
    const incomeCategoryTotals = incomeCategoryGroups.reduce<
      Record<string, number>
    >((collector, group) => {
      const label = group.normalizedCategory ?? "Uncategorized";
      const sum = decimalToNumber(group._sum.amount);
      if (sum === 0) {
        return collector;
      }
      collector[label] = sum;
      return collector;
    }, {});

    const response: SummaryResponse = {
      totalSpent: Math.abs(decimalToNumber(spendAggregate._sum.amount)),
      totalIncome: decimalToNumber(incomeAggregate._sum.amount),
      largestExpense: Math.abs(decimalToNumber(spendAggregate._min.amount)),
      largestIncome: decimalToNumber(incomeAggregate._max.amount),
      spendCount: spendAggregate._count._all ?? 0,
      incomeCount: incomeAggregate._count._all ?? 0,
      categoryTotals,
      incomeCategoryTotals,
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-summary",
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
  }
}
