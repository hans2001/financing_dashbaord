import { jsonErrorResponse } from "@/lib/api-response";
import { ensureDemoUser } from "@/lib/demo-user";
import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";

const parseDaysRequested = () => {
  const rawValue = process.env.PLAID_TRANSACTIONS_DAYS_REQUESTED;
  if (!rawValue) {
    return 730;
  }
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return 730;
  }
  return Math.min(Math.max(Math.floor(parsed), 1), 730);
};

export async function POST() {
  try {
    const user = await ensureDemoUser();
    const daysRequested = parseDaysRequested();
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name:
        process.env.NEXT_PUBLIC_APP_NAME ?? "Personal Finance Dashboard",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      transactions: {
        days_requested: daysRequested,
      },
    });

    return NextResponse.json({ link_token: tokenResponse.data.link_token });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "create-link-token",
    });
  }
}
