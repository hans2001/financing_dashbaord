import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const accounts = await prisma.account.findMany({
      where: {
        bankItem: {
          userId: user.id,
        },
      },
      include: {
        bankItem: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    type AccountWithBankItem = (typeof accounts)[number];

    return NextResponse.json({
      accounts: accounts.map((account: AccountWithBankItem) => ({
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
