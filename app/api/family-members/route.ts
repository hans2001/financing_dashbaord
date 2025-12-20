import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { ensureFamilyMember } from "@/lib/workspace-utils";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server/session";

export async function GET() {
  try {
    if (!(await getAuthenticatedUser())) {
      return unauthorizedResponse();
    }

    const members = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
      },
      orderBy: [
        { displayName: "asc" },
        { id: "asc" },
      ],
    });

    return NextResponse.json({
      members: members.map((member) => ({
        id: member.id,
        displayName: member.displayName,
      })),
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, { route: "family-members-list" });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getAuthenticatedUser())) {
      return unauthorizedResponse();
    }

    const payload = await request.json();
    if (!payload?.id || typeof payload.id !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const member = await ensureFamilyMember(payload.id, payload.displayName);
    return NextResponse.json({
      member: {
        id: member.id,
        displayName: member.displayName,
      },
    });
  } catch (error) {
    return jsonErrorResponse(error, 500, { route: "family-members-create" });
  }
}
