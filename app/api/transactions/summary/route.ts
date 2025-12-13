import { NextResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/family-auth";
import { getTransactionCategoryPath } from "@/lib/transaction-category";
type TransactionWhereInput = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>["where"];

const SUMMARY_CHUNK_SIZE = 1000;

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
    const categoryParam = url.searchParams.get("category");
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

    if (categoryParam && categoryParam !== "all") {
      where.normalizedCategory = categoryParam;
    }

    let offset = 0;
    let totalSpent = 0;
    let totalIncome = 0;
    let largestExpense = 0;
    let largestIncome = 0;
    let spendCount = 0;
    let incomeCount = 0;
    const categoryTotals: Record<string, number> = {};
    const incomeCategoryTotals: Record<string, number> = {};

    while (true) {
      const batch = await prisma.transaction.findMany({
        where,
        orderBy: {
          date: "desc",
        },
        take: SUMMARY_CHUNK_SIZE,
        skip: offset,
        select: {
          amount: true,
          category: true,
          name: true,
          merchantName: true,
          normalizedCategory: true,
        },
      });

      if (batch.length === 0) {
        break;
      }

      offset += batch.length;

      for (const transaction of batch) {
        const amount = transaction.amount.toNumber
          ? transaction.amount.toNumber()
          : Number(transaction.amount.toString());
        if (amount < 0) {
          const absAmount = Math.abs(amount);
          totalSpent += absAmount;
          largestExpense = Math.max(largestExpense, absAmount);
          spendCount += 1;
          const label =
            transaction.normalizedCategory ??
            getTransactionCategoryPath({
              category: transaction.category,
              name: transaction.name,
              merchantName: transaction.merchantName,
            });
          categoryTotals[label] = (categoryTotals[label] ?? 0) + absAmount;
        } else if (amount > 0) {
          totalIncome += amount;
          largestIncome = Math.max(largestIncome, amount);
          incomeCount += 1;
          const label =
            transaction.normalizedCategory ??
            getTransactionCategoryPath({
              category: transaction.category,
              name: transaction.name,
              merchantName: transaction.merchantName,
            });
          incomeCategoryTotals[label] =
            (incomeCategoryTotals[label] ?? 0) + amount;
        }
      }

      if (batch.length < SUMMARY_CHUNK_SIZE) {
        break;
      }
    }

    const response: SummaryResponse = {
      totalSpent,
      totalIncome,
      largestExpense,
      largestIncome,
      spendCount,
      incomeCount,
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
