import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo-user";

export type SerializedSavedView = {
  id: string;
  name: string;
  userId: string;
  isFamilyView: boolean;
  isPinned: boolean;
  slug: string | null;
  metadata: Prisma.JsonValue;
  columnConfig: Prisma.JsonValue | null;
  createdAt: string;
  updatedAt: string;
};

export const formatSavedView = (
  view: { id: string; name: string; userId: string; slug: string | null; isFamilyView: boolean; isPinned: boolean; metadata: Prisma.JsonValue; columnConfig: Prisma.JsonValue | null; createdAt: Date; updatedAt: Date },
): SerializedSavedView => ({
  id: view.id,
  name: view.name,
  userId: view.userId,
  isFamilyView: view.isFamilyView,
  isPinned: view.isPinned,
  slug: view.slug,
  metadata: view.metadata,
  columnConfig: view.columnConfig,
  createdAt: view.createdAt.toISOString(),
  updatedAt: view.updatedAt.toISOString(),
});

export async function ensureFamilyMember(id: string, displayName?: string) {
  return prisma.user.upsert({
    where: { id },
    update: displayName ? { displayName } : {},
    create: { id, displayName },
  });
}

export function parseRequestedUserId(request: Request) {
  const headerValue = request.headers.get("x-family-user-id");
  if (headerValue?.trim()) {
    return headerValue.trim();
  }
  const searchParams = new URL(request.url).searchParams;
  const queryValue = searchParams.get("userId");
  if (queryValue?.trim()) {
    return queryValue.trim();
  }
  return DEMO_USER_ID;
}
