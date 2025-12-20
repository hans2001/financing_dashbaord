import { NextResponse as NextServerResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/app/api/transactions/utils";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";

type TrendBucket = {
  date: string;
  spent: number;
  income: number;
};

type TrendResponse = {
  buckets: TrendBucket[];
};

const normalizeCategoryFilters = (rawValues: string[]) =>
  Array.from(
    new Set(
      rawValues
        .map((value) => value?.trim())
        .filter(Boolean),
    ),
  );

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const accountIds = url.searchParams.getAll("accountId").filter(Boolean);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const categoryParams = normalizeCategoryFilters(
      url.searchParams.getAll("category"),
    );
    const flow = url.searchParams.get("flow") ?? "all";

    const whereConditions: Prisma.Sql[] = [
      Prisma.sql`b."userId" = ${user.id}`,
    ];

    const filteredAccountIds = accountIds.filter((id) => id !== "all");
    if (filteredAccountIds.length > 0) {
      const uniqueAccountIds = Array.from(new Set(filteredAccountIds));
      const validatedAccounts = await prisma.account.findMany({
        where: {
          id: { in: uniqueAccountIds },
        bankItem: {
          userId: user.id,
        },
        },
        select: {
          id: true,
        },
      });
      if (validatedAccounts.length !== uniqueAccountIds.length) {
        return NextServerResponse.json(
          { error: "Account filter not found" },
          { status: 400 },
        );
      }
      whereConditions.push(
        Prisma.sql`a.id IN (${Prisma.join(
          uniqueAccountIds.map((accountId) => Prisma.sql`${accountId}`),
        )})`,
      );
    }

    if (startDate) {
      whereConditions.push(
        Prisma.sql`"t"."date" >= ${new Date(startDate)}`,
      );
    }
    if (endDate) {
      whereConditions.push(Prisma.sql`"t"."date" <= ${new Date(endDate)}`);
    }

    if (categoryParams.length > 0) {
      whereConditions.push(
        Prisma.sql`"t"."normalizedCategory" IN (${Prisma.join(
          categoryParams.map((category) => Prisma.sql`${category}`),
        )})`,
      );
    }

    if (flow === "spending") {
      whereConditions.push(Prisma.sql`"t"."amount" < 0`);
    } else if (flow === "inflow") {
      whereConditions.push(Prisma.sql`"t"."amount" > 0`);
    }

    const [firstCondition, ...restConditions] = whereConditions;
    if (!firstCondition) {
      throw new Error("No conditions provided for trends query");
    }
    let whereClause = firstCondition;
    for (const condition of restConditions) {
      whereClause = Prisma.sql`${whereClause} AND ${condition}`;
    }

    const query = Prisma.sql`
      SELECT
        date_trunc('day', "t"."date") AS bucket,
        SUM(CASE WHEN "t"."amount" < 0 THEN "t"."amount" ELSE 0 END) AS spend_total,
        SUM(CASE WHEN "t"."amount" > 0 THEN "t"."amount" ELSE 0 END) AS income_total
      FROM "Transaction" AS "t"
      JOIN "Account" AS "a" ON "a"."id" = "t"."accountId"
      JOIN "BankItem" AS "b" ON "b"."id" = "a"."bankItemId"
      WHERE ${whereClause}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    const rawBuckets = await prisma.$queryRaw<
      {
        bucket: Date;
        spend_total: Prisma.Decimal | null;
        income_total: Prisma.Decimal | null;
      }[]
    >(query);

    const buckets = rawBuckets.map((row) => {
      const bucketDate = row.bucket ?? new Date();
      const isoDate = new Date(bucketDate).toISOString().slice(0, 10);
      return {
        date: isoDate,
        spent: Math.abs(decimalToNumber(row.spend_total)),
        income: decimalToNumber(row.income_total),
      };
    });

    return NextServerResponse.json<TrendResponse>({ buckets });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-trends",
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
  }
}
