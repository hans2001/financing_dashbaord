import { jsonErrorResponse } from "@/lib/api-response";
import { refreshAccountBalances } from "@/lib/account-balances";
import { prisma } from "@/lib/prisma";
import { getPlaidClient } from "@/lib/plaid";
import { CountryCode } from "plaid";
import { NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const publicToken = body?.public_token;

    if (typeof publicToken !== "string" || !publicToken.trim()) {
      return NextResponse.json(
        { error: "public_token is required" },
        { status: 400 },
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const plaidClient = getPlaidClient();
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = exchangeResponse.data;

    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data?.item?.institution_id ?? null;

    let institutionName: string | null = null;
    if (institutionId) {
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = institutionResponse.data.institution?.name ?? null;
    }

    const bankItem = await prisma.bankItem.upsert({
      where: { plaidItemId: item_id },
      update: {
        accessToken: access_token,
        institutionId,
        institutionName,
      },
      create: {
        userId: user.id,
        plaidItemId: item_id,
        institutionId,
        institutionName,
        accessToken: access_token,
      },
    });

    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    await Promise.all(
      accountsResponse.data.accounts.map((account) =>
        prisma.account.upsert({
          where: { plaidAccountId: account.account_id },
          update: {
            bankItemId: bankItem.id,
            name: account.name,
            officialName: account.official_name ?? null,
            mask: account.mask ?? null,
            type: account.type,
            subtype: account.subtype ?? null,
            currency: account.balances?.iso_currency_code ?? null,
          },
          create: {
            bankItemId: bankItem.id,
            plaidAccountId: account.account_id,
            name: account.name,
            officialName: account.official_name ?? null,
            mask: account.mask ?? null,
            type: account.type,
            subtype: account.subtype ?? null,
            currency: account.balances?.iso_currency_code ?? null,
          },
        }),
      ),
    );

    await refreshAccountBalances({
      bankItemId: bankItem.id,
      accessToken: access_token,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "exchange-public-token",
      hasBody: Boolean(request.body),
    });
  }
}
