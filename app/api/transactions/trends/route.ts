import { NextResponse as NextServerResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/app/api/transactions/utils";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";
import { parseTransactionsQuery } from "@/app/api/transactions/query";

type TrendBucket = {
  date: string;
  spent: number;
  income: number;
};

type TrendResponse = {
  buckets: TrendBucket[];
};

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { data, error } = await parseTransactionsQuery(request, user.id, {
      includeFlow: true,
    });
    if (error) {
      return error;
    }
    const flow = data.flow ?? "all";

    const whereConditions: Prisma.Sql[] = [
      Prisma.sql`b."userId" = ${user.id}`,
    ];

    if (data.accountIds.length > 0) {
      whereConditions.push(
        Prisma.sql`a.id IN (${Prisma.join(
          data.accountIds.map((accountId) => Prisma.sql`${accountId}`),
        )})`,
      );
    }

    if (data.startDate) {
      whereConditions.push(
        Prisma.sql`"t"."date" >= ${data.startDate}`,
      );
    }
    if (data.endDate) {
      whereConditions.push(Prisma.sql`"t"."date" <= ${data.endDate}`);
    }

    if (data.categories.length > 0) {
      whereConditions.push(
        Prisma.sql`"t"."normalizedCategory" IN (${Prisma.join(
          data.categories.map((category) => Prisma.sql`${category}`),
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
