import { NextResponse } from "next/server";

export function jsonErrorResponse(
  error: unknown,
  status = 500,
  context?: Record<string, unknown>,
) {
  console.error("[API ERROR]", {
    ...(context ?? {}),
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}
