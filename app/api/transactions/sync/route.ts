import { jsonErrorResponse } from "@/lib/api-response";
import { refreshAccountBalances } from "@/lib/account-balances";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";
import { getTransactionCategoryPath } from "@/lib/transaction-category";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";

const DEFAULT_LOOKBACK_DAYS = 90;
const DEFAULT_PAGE_SIZE = 500;

type PlaidTransaction = {
  transaction_id?: string | null;
  account_id?: string | null;
  amount?: number | null;
  merchant_name?: string | null;
  name?: string | null;
  category?: string[] | null;
  pending?: boolean | null;
  date?: string | null;
  iso_currency_code?: string | null;
};

function formatShortDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function compactStrings(values: (string | null | undefined)[]) {
  return values.filter((value): value is string => typeof value === "string");
}

function resolvePageSize() {
  const configured = Number(process.env.PLAID_TRANSACTIONS_PAGE_SIZE);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return DEFAULT_PAGE_SIZE;
}

async function buildBatchLookups(transactions: PlaidTransaction[]) {
  const plaidAccountIds = Array.from(
    new Set(compactStrings(transactions.map((transaction) => transaction.account_id))),
  );
  const accounts =
    plaidAccountIds.length > 0
      ? await prisma.account.findMany({
          where: {
            plaidAccountId: {
              in: plaidAccountIds,
            },
          },
        })
      : [];
  type AccountLookupEntry = {
    id: string;
    plaidAccountId: string;
  };
  const accountLookup = new Map(
    (accounts as AccountLookupEntry[]).map((account) => [
      account.plaidAccountId,
      account,
    ]),
  );

  const transactionIds = Array.from(
    new Set(
      compactStrings(
        transactions.map((transaction) => transaction.transaction_id),
      ),
    ),
  );
  type ExistingTransaction = {
    plaidTransactionId: string;
  };
  const existingTransactions: ExistingTransaction[] =
    transactionIds.length > 0
      ? await prisma.transaction.findMany({
          where: {
            plaidTransactionId: {
              in: transactionIds,
            },
          },
          select: {
            plaidTransactionId: true,
          },
        })
      : [];
  const existingTransactionIds = new Set(
    existingTransactions.map((tx) => tx.plaidTransactionId),
  );

  return {
    accountLookup,
    existingTransactionIds,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

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

    const selectColumns = {
      id: true,
      accessToken: true,
      lastSyncedRequestId: true,
      lastSyncedTotalTransactions: true,
    };

    const items = payload.bankItemId
      ? await prisma.bankItem.findMany({
          where: {
            id: payload.bankItemId,
            userId: user.id,
          },
          select: selectColumns,
        })
      : await prisma.bankItem.findMany({
          where: {
            userId: user.id,
          },
          select: selectColumns,
        });

    const summary = {
      fetched: 0,
      inserted: 0,
      updated: 0,
    };

    type TransactionUpsertArgs = Parameters<typeof prisma.transaction.upsert>[0];
    type TransactionUpdatePayload = TransactionUpsertArgs["update"] & {
      normalizedCategory: string;
    };
    type TransactionCreatePayload = TransactionUpsertArgs["create"] & {
      normalizedCategory: string;
    };

    for (const item of items) {
      let offset = 0;
      let latestRequestId: string | null = null;
      let totalTransactions = item.lastSyncedTotalTransactions ?? 0;
      const pageSize = resolvePageSize();

      while (true) {
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: item.accessToken,
          start_date: startDate ?? "",
          end_date: endDate ?? "",
          options: {
            count: pageSize,
            offset,
          },
        });

        const requestId = transactionsResponse.data.request_id ?? null;
        latestRequestId = requestId ?? latestRequestId;
        totalTransactions =
          transactionsResponse.data.total_transactions ?? totalTransactions;

        const transactions = transactionsResponse.data.transactions ?? [];
        summary.fetched += transactions.length;

        console.info(
          "\x1b[35m[transactions-sync][PLAID_BATCH][PLAID_SYNC_MONITOR]\x1b[0m",
          JSON.stringify({
            bankItemId: item.id,
            requestId,
            totalTransactions,
            transactionsInBatch: transactions.length,
          }),
        );

        const { accountLookup, existingTransactionIds } =
          await buildBatchLookups(transactions);

        for (const tx of transactions) {
          const accountId = tx.account_id ?? "";
          const account = accountLookup.get(accountId);

          if (!account) {
            console.warn(
              "Skipping transaction for unknown account",
              tx.account_id,
            );
            continue;
          }

          const transactionId = tx.transaction_id;
          if (!transactionId) {
            console.warn("Skipping transaction with missing id", tx);
            continue;
          }

          if (existingTransactionIds.has(transactionId)) {
            summary.updated += 1;
          } else {
            summary.inserted += 1;
          }

          const normalizedTx = JSON.parse(JSON.stringify(tx));
          const normalizedCategory = getTransactionCategoryPath({
            merchantName: tx.merchant_name,
            name: tx.name,
            category: tx.category,
            amount: Number(tx.amount),
          });
          const normalizedAmount = -(tx.amount ?? 0);
          const transactionName =
            tx.name ?? tx.merchant_name ?? "Unlabeled transaction";

          const updatePayload: TransactionUpdatePayload = {
            accountId: account.id,
            amount: normalizedAmount,
            category: tx.category ?? [],
            date: new Date(tx.date ?? ""),
            isoCurrencyCode: tx.iso_currency_code ?? null,
            merchantName: tx.merchant_name ?? null,
            name: transactionName,
            pending: tx.pending,
            raw: normalizedTx,
            normalizedCategory,
          };

          const createPayload: TransactionCreatePayload = {
            accountId: account.id,
            plaidTransactionId: transactionId,
            amount: normalizedAmount,
            category: tx.category ?? [],
            date: new Date(tx.date ?? ""),
            isoCurrencyCode: tx.iso_currency_code ?? null,
            merchantName: tx.merchant_name ?? null,
            name: transactionName,
            pending: tx.pending,
            raw: normalizedTx,
            normalizedCategory,
          };

          await prisma.transaction.upsert({
            where: { plaidTransactionId: transactionId },
            update: updatePayload,
            create: createPayload,
          });
        }

        offset += transactions.length;
        const hasMore =
          transactions.length === pageSize &&
          offset < totalTransactions &&
          transactions.length > 0;
        if (!hasMore) {
          break;
        }
      }

      await refreshAccountBalances({
        bankItemId: item.id,
        accessToken: item.accessToken,
      });

      await prisma.bankItem.update({
        where: { id: item.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncedRequestId: latestRequestId,
          lastSyncedTotalTransactions: totalTransactions,
        },
      });
    }

    return NextResponse.json(summary);
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-sync",
      payloadProvided: Boolean(request.body),
    });
  }
}
