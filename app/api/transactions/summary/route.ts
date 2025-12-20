import { NextResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";
import { decimalToNumber } from "@/app/api/transactions/utils";
import { parseTransactionsQuery } from "@/app/api/transactions/query";

type TransactionWhereInput = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>["where"];

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
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { data, error } = await parseTransactionsQuery(request, user.id);
    if (error) {
      return error;
    }
    const where: TransactionWhereInput = {
      account: {
        bankItem: {
          userId: user.id,
        },
      },
    };

    if (data.accountIds.length > 0) {
      where.accountId = {
        in: data.accountIds,
      };
    }

    if (data.startDate || data.endDate) {
      where.date = {};
      if (data.startDate) {
        where.date.gte = data.startDate;
      }
      if (data.endDate) {
        where.date.lte = data.endDate;
      }
    }

    if (data.categories.length > 0) {
      where.normalizedCategory = {
        in: data.categories,
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
