import { jsonErrorResponse } from "@/lib/api-response";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
      accounts: accounts.map((account: {
        id: string;
        name: string;
        officialName: string | null;
        mask: string | null;
        type: string;
        subtype: string | null;
        bankItem: { institutionName: string | null };
        currentBalance: Prisma.Decimal | null;
        availableBalance: Prisma.Decimal | null;
        creditLimit: Prisma.Decimal | null;
        balanceLastUpdated: Date | null;
      }) => ({
        id: account.id,
        name: account.name,
        officialName: account.officialName,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        institutionName: account.bankItem.institutionName ?? undefined,
        currentBalance:
          account.currentBalance !== null
            ? Number(account.currentBalance)
            : null,
        availableBalance:
          account.availableBalance !== null
            ? Number(account.availableBalance)
            : null,
        creditLimit:
          account.creditLimit !== null
            ? Number(account.creditLimit)
            : null,
        balanceLastUpdated: account.balanceLastUpdated
          ? account.balanceLastUpdated.toISOString()
          : null,
      })),
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, { route: "accounts-list" });
  }
}
