import { NextResponse } from "next/server";

const FAMILY_AUTH_HEADER = "x-family-secret";
const FAMILY_COOKIE_NAME = "__Secure-family-secret";
const FAMILY_SECRET = (() => {
  const secret =
    process.env.FAMILY_AUTH_TOKEN ?? process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN;
  if (!secret) {
    throw new Error(
      "FAMILY_AUTH_TOKEN must be set to authorize dashboard API requests",
    );
  }
  if (secret.length < 16) {
    throw new Error(
      "FAMILY_AUTH_TOKEN must be at least 16 characters for security reasons",
    );
  }
  return secret;
})();
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.FAMILY_RATE_LIMIT_WINDOW_MS ?? "60000",
);
const RATE_LIMIT_MAX = Number(process.env.FAMILY_RATE_LIMIT_MAX ?? "60");

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateEntry>();

function consumeRateLimit(key: string) {
  if (RATE_LIMIT_MAX <= 0) {
    return true;
  }
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, {
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

function extractClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  const [ip] = forwardedFor.split(",").map((value) => value.trim());
  return ip || "unknown";
}

function getRateLimitKey(
  request: Request,
  providedSecret: string,
  source: "header" | "cookie" | "none",
) {
  const ip = extractClientIp(request);
  const isValidSecret = providedSecret === FAMILY_SECRET;
  const bucket = isValidSecret ? "valid" : "invalid";
  return `${bucket}:${source}:${ip}`;
}

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split("="))
    .map(([key, value]) => [key ?? "", value ?? ""] as const)
    .find(([key]) => key === name)?.[1];
}

function extractSecretFromRequest(request: Request) {
  const headerSecret = request.headers.get(FAMILY_AUTH_HEADER) ?? "";
  if (headerSecret) {
    return { secret: headerSecret, source: "header" as const };
  }
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader) {
    return { secret: "", source: "none" as const };
  }
  const cookieSecret =
    getCookieValue(cookieHeader, FAMILY_COOKIE_NAME) ?? "";
  if (cookieSecret) {
    return { secret: cookieSecret, source: "cookie" as const };
  }
  return { secret: "", source: "none" as const };
}

type AuthorizationSuccess = {
  ok: true;
  token: string;
};

type AuthorizationFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthorizationResult = AuthorizationSuccess | AuthorizationFailure;

export function authorizeRequest(request: Request): AuthorizationResult {
  const { secret: providedSecret, source } = extractSecretFromRequest(request);
  const rateKey = getRateLimitKey(request, providedSecret, source);
  if (!consumeRateLimit(rateKey)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      ),
    };
  }

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

  return { ok: true, token: providedSecret };
}

export function getFamilyHeaderValue() {
  return FAMILY_SECRET;
}

export function resetFamilyRateLimit() {
  rateLimitMap.clear();
}
