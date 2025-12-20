import { prisma } from "@/lib/prisma";
import { getPlaidClient } from "@/lib/plaid";

type RefreshArgs = {
  bankItemId: string;
  accessToken: string;
};

/**
 * Pulls the freshest balances from Plaid and persists them for every account
 * under the provided bank item.
 */
export async function refreshAccountBalances({
  bankItemId,
  accessToken,
}: RefreshArgs) {
  const plaidClient = getPlaidClient();
  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });

  const accounts = response.data.accounts ?? [];

  await Promise.all(
    accounts.map((account) => {
      const {
        available: availableBalance = null,
        current: currentBalance = null,
        limit: creditLimit = null,
        iso_currency_code: currency = null,
        last_updated_datetime: lastUpdated,
      } = account.balances ?? {};

      const balanceLastUpdated = lastUpdated
        ? new Date(lastUpdated)
        : new Date();

      return prisma.account.upsert({
        where: { plaidAccountId: account.account_id },
        update: {
          name: account.name,
          officialName: account.official_name ?? null,
          mask: account.mask ?? null,
          type: account.type,
          subtype: account.subtype ?? null,
          currency,
          currentBalance,
          availableBalance,
          creditLimit,
          balanceLastUpdated,
        },
        create: {
          bankItemId,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name ?? null,
          mask: account.mask ?? null,
          type: account.type,
          subtype: account.subtype ?? null,
          currency,
          currentBalance,
          availableBalance,
          creditLimit,
          balanceLastUpdated,
        },
      });
    }),
  );

  return {
    bankItemId,
    refreshedAccounts: accounts.length,
  };
}
