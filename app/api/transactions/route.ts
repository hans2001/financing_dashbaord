import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/family-auth";

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
};

const MAX_PAGE_SIZE = 1000;

export async function GET(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limitParam = Number(url.searchParams.get("limit") ?? 100);
    const offsetParam = Number(url.searchParams.get("offset") ?? 0);
    const sortParam = url.searchParams.get("sort") ?? "date_desc";
    const flowParam = url.searchParams.get("flow") ?? "all";

    const limit = Math.min(Math.max(limitParam, 1), MAX_PAGE_SIZE);
    const offset = Math.max(offsetParam, 0);

    const where: TransactionWhereInput = {
      account: {
        bankItem: {
          userId: DEMO_USER_ID,
        },
      },
    };

    if (accountId && accountId !== "all") {
      const validatedAccount = await prisma.account.findFirst({
        where: {
          id: accountId,
          bankItem: {
            userId: DEMO_USER_ID,
          },
        },
      });
      if (!validatedAccount) {
        return NextResponse.json(
          { error: "Account filter not found" },
          { status: 400 },
        );
      }
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

    if (flowParam === "spending") {
      where.amount = { lt: 0 };
    } else if (flowParam === "inflow") {
      where.amount = { gt: 0 };
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
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      total,
      transactions: transactions.map((transaction: TransactionRecord) => {
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
