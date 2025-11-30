import { Prisma } from "@prisma/client";
import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const MAX_PAGE_SIZE = 1000;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limitParam = Number(url.searchParams.get("limit") ?? 100);
    const offsetParam = Number(url.searchParams.get("offset") ?? 0);

    const limit = Math.min(Math.max(limitParam, 1), MAX_PAGE_SIZE);
    const offset = Math.max(offsetParam, 0);

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

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            include: {
              bankItem: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      total,
      transactions: transactions.map((transaction) => {
        const categoryPath =
          (transaction.category ?? []).filter(Boolean).join(" > ") ||
          "Uncategorized";
        const rawData = transaction.raw as Record<string, unknown> | null;
        const occurredAtRaw =
          typeof rawData?.datetime === "string" ? rawData.datetime : null;
        const occurredAt = occurredAtRaw
          ? new Date(occurredAtRaw)
          : transaction.date;
        const occurredIso = occurredAt.toISOString();
        const timePart = occurredIso.split("T")[1]?.slice(0, 5) ?? null;

        return {
          id: transaction.id,
          date: occurredIso.split("T")[0],
          time: timePart,
          accountName: transaction.account.name,
          amount: Number(transaction.amount.toString()),
          merchantName: transaction.merchantName ?? transaction.name,
          name: transaction.name,
          category: transaction.category,
          categoryPath,
          pending: transaction.pending,
          status: transaction.pending ? "pending" : "posted",
          isoCurrencyCode: transaction.isoCurrencyCode ?? "USD",
          location: transaction.raw?.location ?? null,
          paymentMeta: transaction.raw?.payment_meta ?? null,
          institutionName:
            transaction.account.bankItem.institutionName ?? undefined,
        };
      }),
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-list",
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
  }
}
