import { NextResponse } from "next/server";

import { jsonErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  transactionId?: string;
};

type Params = {
  params: Promise<RouteParams>;
};

export async function PATCH(request: Request, props: Params) {
  try {
    const resolvedParams = await props.params;
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const transactionsIndex = pathSegments.findIndex(
      (segment) => segment === "transactions",
    );
    const fallbackId =
      transactionsIndex >= 0
        ? pathSegments[transactionsIndex + 1]
        : undefined;

    const transactionId = resolvedParams.transactionId ?? fallbackId;
    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transaction id in the request path" },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const descriptionInput = typeof body.description === "string" ? body.description : "";
    const trimmedDescription = descriptionInput.trim();
    if (trimmedDescription.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or fewer" },
        { status: 400 },
      );
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        description: trimmedDescription.length > 0 ? trimmedDescription : null,
      },
      select: {
        id: true,
        description: true,
      },
    });

    return NextResponse.json({
      transaction: updated,
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "transactions-description-update",
    });
  }
}
