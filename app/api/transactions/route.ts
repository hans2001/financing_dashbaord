import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";
import {
  dropConfSuffix,
  getTransactionCategoryPath,
} from "@/lib/transaction-category";
import { parseTransactionsQuery } from "@/app/api/transactions/query";

type TransactionFindManyArgs = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>;
type TransactionWhereInput = NonNullable<TransactionFindManyArgs["where"]>;
type TransactionRecord = Awaited<
  ReturnType<typeof prisma.transaction.findMany>
>[number] & {
  account: {
    name: string;
    bankItem: {
      institutionName?: string | null;
    };
  };
  normalizedCategory?: string | null;
};

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const { data, error } = await parseTransactionsQuery(request, user.id, {
      includeFlow: true,
    });
    if (error) {
      return error;
    }
    const limitParamRaw = url.searchParams.get("limit");
    const limitParam =
      limitParamRaw === null
        ? 100
        : limitParamRaw === "all"
          ? null
          : Number(limitParamRaw);
    const offsetParam = Number(url.searchParams.get("offset") ?? 0);
    const sortParam = url.searchParams.get("sort") ?? "date_desc";
    const flowParam = data.flow ?? "all";

    const limit =
      limitParam === null
        ? null
        : Number.isFinite(limitParam)
          ? Math.max(Math.floor(limitParam), 1)
          : 100;
    const offset =
      limit === null
        ? 0
        : Number.isFinite(offsetParam)
          ? Math.max(Math.floor(offsetParam), 0)
          : 0;

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

    if (flowParam === "spending") {
      where.amount = { lt: 0 };
    } else if (flowParam === "inflow") {
      where.amount = { gt: 0 };
    }

    if (data.categories.length > 0) {
      where.normalizedCategory = {
        in: data.categories,
      };
    }

    const orderBy = (() => {
      switch (sortParam) {
        case "date_asc":
          return { date: "asc" } as const;
        case "amount_desc":
          if (flowParam === "spending") {
            return { amount: "asc" } as const;
          }
          return { amount: "desc" } as const;
        case "amount_asc":
          if (flowParam === "spending") {
            return { amount: "desc" } as const;
          }
          return { amount: "asc" } as const;
        case "merchant_asc":
          return { merchantName: "asc" } as const;
        case "merchant_desc":
          return { merchantName: "desc" } as const;
        case "date_desc":
        default:
          return { date: "desc" } as const;
      }
    })();

    const paginationArgs =
      limit === null
        ? undefined
        : ({
            take: limit,
            skip: offset,
          } satisfies Pick<TransactionFindManyArgs, "take" | "skip">);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              name: true,
              bankItem: {
                select: {
                  institutionName: true,
                },
              },
            },
          },
        },
        orderBy,
        ...(paginationArgs ?? {}),
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      total,
      transactions: transactions.map((transaction: TransactionRecord) => {
        const categoryPath =
          transaction.normalizedCategory ??
          getTransactionCategoryPath({
            merchantName: transaction.merchantName ?? transaction.name,
            name: transaction.name,
            category: transaction.category,
          });
        const rawData = transaction.raw as Record<string, unknown> | null;
        const rawDate = typeof rawData?.date === "string" ? rawData.date : null;
        const rawDatetime =
          typeof rawData?.datetime === "string" ? rawData.datetime : null;
        const occurredDate =
          rawDatetime?.split("T")[0] ??
          rawDate?.split("T")[0] ??
          transaction.date.toISOString().split("T")[0];
        const timePart = rawDatetime?.split("T")[1]?.slice(0, 5) ?? null;

        return {
          id: transaction.id,
          date: occurredDate,
          time: timePart,
          accountName: transaction.account.name,
          amount: Number(transaction.amount.toString()),
          description: transaction.description ?? null,
          merchantName: dropConfSuffix(
            transaction.merchantName ?? transaction.name,
          ),
          name: dropConfSuffix(transaction.name),
          category: transaction.category,
          categoryPath,
          pending: transaction.pending,
          status: transaction.pending ? "pending" : "posted",
          isoCurrencyCode: transaction.isoCurrencyCode ?? "USD",
          location:
            rawData && typeof rawData === "object" && "location" in rawData
              ? (rawData.location as Record<string, unknown>)
              : null,
          paymentMeta:
            rawData && typeof rawData === "object" && "payment_meta" in rawData
              ? (rawData.payment_meta as Record<string, unknown>)
              : null,
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
