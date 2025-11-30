import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

const SUMMARY_CHUNK_SIZE = 1000;

type SummaryResponse = {
  totalSpent: number;
  totalIncome: number;
  largestExpense: number;
  largestIncome: number;
  spendCount: number;
  incomeCount: number;
  categoryTotals: Record<string, number>;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where: Prisma.TransactionWhereInput = {
      account: {
        bankItem: {
          userId: DEMO_USER_ID,
        },
      },
    };

    if (accountId) {
      where.accountId = accountId;
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

    let offset = 0;
    let totalSpent = 0;
    let totalIncome = 0;
    let largestExpense = 0;
    let largestIncome = 0;
    let spendCount = 0;
    let incomeCount = 0;
    const categoryTotals: Record<string, number> = {};

    while (true) {
      const batch = await prisma.transaction.findMany({
        where,
        select: {
          amount: true,
          category: true,
        },
        orderBy: {
          date: "desc",
        },
        take: SUMMARY_CHUNK_SIZE,
        skip: offset,
      });

      if (batch.length === 0) {
        break;
      }

      offset += batch.length;

      for (const transaction of batch) {
        const amount = Number(transaction.amount.toString());
        if (amount < 0) {
          const absAmount = Math.abs(amount);
          totalSpent += absAmount;
          largestExpense = Math.max(largestExpense, absAmount);
          spendCount += 1;
          const label = transaction.category?.[0] ?? "Uncategorized";
          categoryTotals[label] = (categoryTotals[label] ?? 0) + absAmount;
        } else if (amount > 0) {
          totalIncome += amount;
          largestIncome = Math.max(largestIncome, amount);
          incomeCount += 1;
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
    };

    return NextResponse.json(response);
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-summary",
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
  }
}
