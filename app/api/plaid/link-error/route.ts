import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    console.info("[Plaid Link Exit]", payload);
    return NextResponse.json({ status: "logged" });
  } catch (error) {
    console.error("[Plaid Link Exit] failed to log", error);
    return NextResponse.json({ error: "Unable to log link exit" }, { status: 500 });
  }
}
