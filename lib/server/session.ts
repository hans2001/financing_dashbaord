import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { getAuthOptions } from "@/lib/auth";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
};

export async function getAuthenticatedUser() {
  const testSession = globalThis.__TEST_AUTH_SESSION;
  if (testSession !== undefined) {
    return testSession;
  }

  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) {
      return null;
    }
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "test") {
      return null;
    }
    throw error;
  }
}

export function unauthorizedResponse(message = "Unauthorized access") {
  return NextResponse.json({ error: message }, { status: 401 });
}

declare global {
  var __TEST_AUTH_SESSION: AuthenticatedUser | null | undefined;
}
