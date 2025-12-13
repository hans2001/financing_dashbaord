import { NextResponse } from "next/server";
import { jsonErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/family-auth";
import { prisma } from "@/lib/prisma";
import { parseRequestedUserId } from "@/lib/workspace-utils";

type RouteParams = {
  params: Promise<{ viewId: string }>;
};

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const resolvedParams = await props.params;
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = parseRequestedUserId(request);
    const view = await prisma.savedView.findUnique({
      where: { id: resolvedParams.viewId },
    });

    if (!view || view.isFamilyView || view.userId !== userId) {
      return NextResponse.json(
        { error: "Saved view not found" },
        { status: 404 },
      );
    }

    await prisma.user.updateMany({
      where: { activeSavedViewId: resolvedParams.viewId },
      data: { activeSavedViewId: null },
    });

    await prisma.savedView.delete({ where: { id: resolvedParams.viewId } });

    return NextResponse.json({ deletedId: resolvedParams.viewId });
  } catch (error) {
    return jsonErrorResponse(error, 500, {
      route: "workspace-saved-views-delete",
    });
  }
}
