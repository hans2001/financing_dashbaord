import { jsonErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { authorizeRequest } from "@/lib/family-auth";
import { ensureFamilyMember } from "@/lib/workspace-utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
    }

    const members = await prisma.user.findMany({
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
    const auth = authorizeRequest(request);
    if (!auth.ok) {
      return auth.response;
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
