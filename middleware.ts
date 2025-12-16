import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const FAMILY_COOKIE_NAME = "__Secure-family-secret";
const FAMILY_SECRET = (() => {
  const secret =
    process.env.FAMILY_AUTH_TOKEN ?? process.env.NEXT_PUBLIC_FAMILY_AUTH_TOKEN;
  if (!secret) {
    throw new Error(
      "FAMILY_AUTH_TOKEN must be defined to set the dashboard session cookie",
    );
  }
  return secret;
})();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(FAMILY_COOKIE_NAME)?.value;

  if (!existing || existing !== FAMILY_SECRET) {
    response.cookies.set(FAMILY_COOKIE_NAME, FAMILY_SECRET, COOKIE_OPTIONS);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};




