import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

const DEFAULT_LOOKBACK_DAYS = 90;

function formatShortDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const payload =
      (await request.json().catch(() => ({}))) as {
        bankItemId?: string;
        startDate?: string;
        endDate?: string;
      };

    const endDate = payload.endDate ?? formatShortDate(new Date());
    const startDate =
      payload.startDate ??
      formatShortDate(
        new Date(
          Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
        ),
      );

    const items = payload.bankItemId
      ? await prisma.bankItem.findMany({
          where: {
            id: payload.bankItemId,
            userId: DEMO_USER_ID,
          },
        })
      : await prisma.bankItem.findMany({
          where: {
            userId: DEMO_USER_ID,
          },
        });

    const summary = {
      fetched: 0,
      inserted: 0,
      updated: 0,
    };

    for (const item of items) {
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: item.accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
        },
      });

      const transactions = transactionsResponse.data.transactions ?? [];
      summary.fetched += transactions.length;

      for (const tx of transactions) {
        const account = await prisma.account.findUnique({
          where: { plaidAccountId: tx.account_id },
        });

        if (!account) {
          console.warn(
            "Skipping transaction for unknown account",
            tx.account_id,
          );
          continue;
        }

        const alreadyExists = await prisma.transaction.findUnique({
          where: { plaidTransactionId: tx.transaction_id },
        });
        if (alreadyExists) {
          summary.updated += 1;
        } else {
          summary.inserted += 1;
        }

        const normalizedTx = JSON.parse(JSON.stringify(tx));

        await prisma.transaction.upsert({
          where: { plaidTransactionId: tx.transaction_id },
          update: {
            accountId: account.id,
            amount: tx.amount.toString(),
            category: tx.category ?? [],
            date: new Date(tx.date),
            isoCurrencyCode: tx.iso_currency_code ?? null,
            merchantName: tx.merchant_name ?? null,
            name: tx.name,
            pending: tx.pending,
            raw: normalizedTx,
          },
          create: {
            accountId: account.id,
            plaidTransactionId: tx.transaction_id,
            amount: tx.amount.toString(),
            category: tx.category ?? [],
            date: new Date(tx.date),
            isoCurrencyCode: tx.iso_currency_code ?? null,
            merchantName: tx.merchant_name ?? null,
            name: tx.name,
            pending: tx.pending,
            raw: normalizedTx,
          },
        });
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-sync",
      payloadProvided: Boolean(request.body),
    });
  }
}
