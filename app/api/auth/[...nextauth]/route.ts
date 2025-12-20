import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

type NextAuthHandler = ReturnType<typeof NextAuth>;
type NextAuthRequest = Parameters<NextAuthHandler>[0];

let cachedHandler: NextAuthHandler | null = null;

const getHandler = (): NextAuthHandler => {
  if (!cachedHandler) {
    cachedHandler = NextAuth(getAuthOptions());
  }
  return cachedHandler;
};

export const GET = (request: NextAuthRequest) => getHandler()(request);
export const POST = (request: NextAuthRequest) => getHandler()(request);
