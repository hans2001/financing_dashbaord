import { verify } from "argon2";
import CredentialsProvider from "next-auth/providers/credentials";
import type { CallbacksOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { NextAuthOptions } from "next-auth";

type AuthToken = JWT & {
  userId?: string;
  email?: string | null;
  name?: string | null;
};

type JwtCallbackParams = Parameters<CallbacksOptions["jwt"]>[0];
type SessionCallbackParams = Parameters<CallbacksOptions["session"]>[0];

let cachedAuthOptions: NextAuthOptions | null = null;

export const getAuthOptions = (): NextAuthOptions => {
  if (cachedAuthOptions) {
    return cachedAuthOptions;
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    throw new Error("NEXTAUTH_SECRET must be set to initialize authentication");
  }

  if (!process.env.NEXTAUTH_URL) {
    const baseUrl =
      process.env.APP_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined);
    if (baseUrl) {
      process.env.NEXTAUTH_URL = baseUrl;
    }
  }

  cachedAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: {
            label: "Email",
            type: "email",
            placeholder: "hello@example.com",
          },
          password: {
            label: "Password",
            type: "password",
          },
        },
        authorize: async (credentials) => {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { prisma } = await import("@/lib/prisma");
          const normalizedEmail = credentials.email.trim().toLowerCase();
          const user = await prisma.user.findFirst({
            where: { email: normalizedEmail },
          });

          if (!user || !user.passwordHash || !user.isActive) {
            return null;
          }

          const passwordMatches = await verify(
            user.passwordHash,
            credentials.password,
          );
          if (!passwordMatches) {
            return null;
          }

          return {
            id: user.id,
            email: user.email ?? null,
            name: user.displayName ?? null,
          };
        },
      }),
    ],
    callbacks: {
      jwt({
        token,
        user,
      }: JwtCallbackParams) {
        const authToken = token as AuthToken;
        if (user) {
          authToken.userId = user.id;
          authToken.email = user.email ?? null;
          authToken.name = user.name ?? null;
        }
        return authToken;
      },
      session({
        session,
        token,
      }: SessionCallbackParams) {
        const authToken = token as AuthToken;
        if (authToken.userId) {
          session.user = {
            ...session.user,
            id: authToken.userId,
            email: authToken.email ?? session.user?.email ?? null,
            name: authToken.name ?? session.user?.name ?? null,
          };
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
    session: {
      strategy: "jwt",
    },
    secret: nextAuthSecret,
  };

  return cachedAuthOptions;
};
