import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeValues = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter(Boolean),
    ),
  );

const isValidIsoDate = (value: string) => {
  if (!ISO_DATE_REGEX.test(value)) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.toISOString().slice(0, 10) === value;
};

type ParsedTransactionsQuery = {
  accountIds: string[];
  startDate?: Date;
  endDate?: Date;
  categories: string[];
  flow?: string;
};

type ParseResult =
  | { data: ParsedTransactionsQuery; error?: never }
  | { data?: never; error: NextResponse };

export async function parseTransactionsQuery(
  request: Request,
  userId: string,
  options?: { includeFlow?: boolean },
): Promise<ParseResult> {
  const url = new URL(request.url);
  const accountIds = normalizeValues(url.searchParams.getAll("accountId"));
  const startDateRaw = url.searchParams.get("startDate");
  const endDateRaw = url.searchParams.get("endDate");

  if (startDateRaw && !isValidIsoDate(startDateRaw)) {
    return {
      error: NextResponse.json(
        { error: "Invalid startDate" },
        { status: 400 },
      ),
    };
  }
  if (endDateRaw && !isValidIsoDate(endDateRaw)) {
    return {
      error: NextResponse.json(
        { error: "Invalid endDate" },
        { status: 400 },
      ),
    };
  }

  const filteredAccountIds = accountIds.filter((id) => id !== "all");
  let validatedAccountIds: string[] = [];
  if (filteredAccountIds.length > 0) {
    const uniqueAccountIds = Array.from(new Set(filteredAccountIds));
    const validatedAccounts = await prisma.account.findMany({
      where: {
        id: {
          in: uniqueAccountIds,
        },
        bankItem: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });
    if (validatedAccounts.length !== uniqueAccountIds.length) {
      return {
        error: NextResponse.json(
          { error: "Account filter not found" },
          { status: 400 },
        ),
      };
    }
    validatedAccountIds = uniqueAccountIds;
  }

  const categories = normalizeValues(url.searchParams.getAll("category")).filter(
    (value) => value !== "all",
  );

  return {
    data: {
      accountIds: validatedAccountIds,
      startDate: startDateRaw ? new Date(startDateRaw) : undefined,
      endDate: endDateRaw ? new Date(endDateRaw) : undefined,
      categories,
      flow: options?.includeFlow ? url.searchParams.get("flow") ?? "all" : undefined,
    },
  };
}
