import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import {
  ensureFamilyMember,
  formatSavedView,
  parseRequestedUserId,
} from "@/lib/workspace-utils";

type SavedViewMetadata = Prisma.InputJsonObject;

function sanitizeMetadata(value: unknown): SavedViewMetadata {
  const mutableMetadata = (
    value && typeof value === "object"
      ? { ...((value as Record<string, unknown>) ?? {}) }
      : {}
  ) as Record<string, unknown>;
  const selectedAccounts = Array.isArray(mutableMetadata.selectedAccountIds)
    ? mutableMetadata.selectedAccountIds
    : [];
  mutableMetadata.selectedAccountIds = selectedAccounts
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);
  return mutableMetadata as SavedViewMetadata;
}

export async function GET(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = parseRequestedUserId(request);
    const user = await ensureFamilyMember(userId);
    const savedViews = await prisma.savedView.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      savedViews: savedViews.map(formatSavedView),
      activeSavedViewId: user.activeSavedViewId,
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "workspace-saved-views",
    });
  }
}

export async function POST(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = parseRequestedUserId(request);
    await ensureFamilyMember(userId);

    const payload = await request.json();
    const name = payload?.name;
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "A name is required for the saved view" },
        { status: 400 },
      );
    }

    const metadata = sanitizeMetadata(payload?.metadata);
    const columnConfig =
      payload?.columnConfig && typeof payload.columnConfig === "object"
        ? (payload.columnConfig as Prisma.InputJsonValue)
        : Prisma.DbNull;

    const data = {
      name,
      metadata,
      columnConfig,
      isPinned: Boolean(payload?.isPinned),
      userId,
    };

    if (payload?.id) {
      const existing = await prisma.savedView.findUnique({
        where: { id: payload.id },
      });
      if (!existing || existing.userId !== userId) {
        return NextResponse.json(
          { error: "Saved view not found" },
          { status: 404 },
        );
      }
      if (existing.isFamilyView) {
        return NextResponse.json(
          { error: "The family workspace cannot be edited directly" },
          { status: 403 },
        );
      }
      const updated = await prisma.savedView.update({
        where: { id: payload.id },
        data,
      });
      return NextResponse.json({ view: formatSavedView(updated) });
    }

    const created = await prisma.savedView.create({ data });
    return NextResponse.json({ view: formatSavedView(created) });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "workspace-saved-views-save",
    });
  }
}
