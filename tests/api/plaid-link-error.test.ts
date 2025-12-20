import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/plaid/link-error/route";

describe("Plaid link error route", () => {
  it("acknowledges valid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/plaid/link-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: true }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "logged" });
  });

  it("returns a 500 payload when logging fails", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {
      throw new Error("boom");
    });

    const request = {
      json: vi.fn().mockResolvedValue({ payload: "ignored" }),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to log link exit" });

    infoSpy.mockRestore();
  });
});
