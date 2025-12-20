import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";
import { parseTransactionsQuery } from "@/app/api/transactions/query";

type TransactionWhereInput = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>["where"];

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

    const categoryGroups = await prisma.transaction.groupBy({
      where,
      by: ["normalizedCategory"],
      orderBy: {
        normalizedCategory: "asc",
      },
    });

    const categories = (categoryGroups as Array<{
      normalizedCategory: string | null;
    }>)
      .map((group) => group.normalizedCategory ?? "Uncategorized")
      .filter(Boolean);

    return NextResponse.json({ categories });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-categories",
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
  }
}
