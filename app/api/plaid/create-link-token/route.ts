import { jsonErrorResponse } from "@/lib/api-response";
import { ensureDemoUser } from "@/lib/demo-user";
import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await ensureDemoUser();
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name:
        process.env.NEXT_PUBLIC_APP_NAME ?? "Personal Finance Dashboard",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    return NextResponse.json({ link_token: tokenResponse.data.link_token });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "create-link-token",
    });
  }
}
