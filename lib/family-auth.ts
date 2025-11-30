import { NextResponse } from "next/server";

const FAMILY_AUTH_HEADER = "x-family-secret";
const DEFAULT_FAMILY_SECRET = "family-dashboard-secret";
const FAMILY_SECRET =
  process.env.FAMILY_AUTH_TOKEN ?? process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN ?? DEFAULT_FAMILY_SECRET;
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.FAMILY_RATE_LIMIT_WINDOW_MS ?? "60000",
);
const RATE_LIMIT_MAX = Number(process.env.FAMILY_RATE_LIMIT_MAX ?? "60");

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateEntry>();

function consumeRateLimit(secret: string) {
  if (RATE_LIMIT_MAX <= 0) {
    return true;
  }
  const now = Date.now();
  const entry = rateLimitMap.get(secret);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(secret, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function authorizeRequest(request: Request) {
  const providedSecret = request.headers.get(FAMILY_AUTH_HEADER) ?? "";
  if (providedSecret !== FAMILY_SECRET) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Unauthorized access",
        },
        { status: 403 },
      ),
    };
  }

  if (!consumeRateLimit(providedSecret)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      ),
    };
  }

  return { ok: true, token: providedSecret };
}

export function getFamilyHeaderValue() {
  return FAMILY_SECRET;
}
