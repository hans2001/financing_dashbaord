import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";

type TransactionWhereInput = NonNullable<
  Parameters<typeof prisma.transaction.findMany>[0]
>["where"];

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const accountIds = url
      .searchParams.getAll("accountId")
      .filter(Boolean);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const where: TransactionWhereInput = {
      account: {
        bankItem: {
          userId: user.id,
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
            userId: user.id,
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

    const categoryGroups = await prisma.transaction.groupBy({
      where,
      by: ["normalizedCategory"],
      orderBy: {
        normalizedCategory: "asc",
      },
    });

    const categories = categoryGroups
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
