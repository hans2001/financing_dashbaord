import { NextResponse } from "next/server";
import { isAxiosError } from "axios";

export function jsonErrorResponse(
  error: unknown,
  status = 500,
  context?: Record<string, unknown>,
) {
  const baseMessage = error instanceof Error ? error.message : "Unknown error";
  const axiosMetadata = isAxiosError(error)
    ? {
        axiosStatus: error.response?.status,
        axiosResponse: error.response?.data,
        axiosRequest: {
          method: error.config?.method,
          url: error.config?.url,
        },
      }
    : {};
  console.error("[API ERROR]", {
    ...(context ?? {}),
    ...axiosMetadata,
    message: baseMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });
  return NextResponse.json({ error: baseMessage }, { status });
}
