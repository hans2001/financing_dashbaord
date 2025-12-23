import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

type NextAuthHandler = ReturnType<typeof NextAuth>;
type NextAuthRequest = Parameters<NextAuthHandler>[0];

let cachedHandler: NextAuthHandler | null = null;

export const runtime = "nodejs";

const getHandler = (): NextAuthHandler => {
  if (!cachedHandler) {
    cachedHandler = NextAuth(getAuthOptions());
  }
  return cachedHandler;
};

export const GET = (
  request: NextAuthRequest,
  context: Parameters<NextAuthHandler>[1],
) => getHandler()(request, context);
export const POST = (
  request: NextAuthRequest,
  context: Parameters<NextAuthHandler>[1],
) => getHandler()(request, context);
