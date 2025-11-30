import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/family-auth";

export async function GET(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const accounts = await prisma.account.findMany({
      where: {
        bankItem: {
          userId: DEMO_USER_ID,
        },
      },
      include: {
        bankItem: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        officialName: account.officialName,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        institutionName: account.bankItem.institutionName ?? undefined,
      })),
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, { route: "accounts-list" });
  }
}
