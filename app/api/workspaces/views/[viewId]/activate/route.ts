import { NextResponse } from "next/server";
import { jsonErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { ensureFamilyMember, parseRequestedUserId } from "@/lib/workspace-utils";

type RouteParams = {
  params: Promise<{ viewId: string }>;
};

export async function POST(request: Request, props: RouteParams) {
  try {
    const resolvedParams = await props.params;
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = parseRequestedUserId(request);
    await ensureFamilyMember(userId);

    const view = await prisma.savedView.findUnique({
      where: { id: resolvedParams.viewId },
    });
    if (!view || (view.userId !== userId && !view.isFamilyView)) {
      return NextResponse.json(
        { error: "Saved view not found" },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { activeSavedViewId: resolvedParams.viewId },
    });

    return NextResponse.json({ activeSavedViewId: resolvedParams.viewId });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "workspace-saved-views-activate",
    });
  }
}
