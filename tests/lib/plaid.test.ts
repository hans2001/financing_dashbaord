import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const configurationMock = vi.fn(function (options) {
  return options;
});
const plaidApiMock = vi.fn(function (config) {
  return { config };
});

vi.mock("plaid", () => ({
  Configuration: configurationMock,
  PlaidApi: plaidApiMock,
  PlaidEnvironments: {
    sandbox: "https://sandbox.plaid.example",
    production: "https://production.plaid.example",
  },
}));

describe("lib/plaid client", () => {
  beforeEach(() => {
    vi.resetModules();
    configurationMock.mockReset();
    plaidApiMock.mockReset();
    configurationMock.mockImplementation(function (options) {
      return options;
    });
    plaidApiMock.mockImplementation(function (config) {
      return { config };
    });
    process.env.PLAID_CLIENT_ID = "client-id";
    process.env.PLAID_SECRET = "secret";
    process.env.PLAID_ENV = "sandbox";
  });

  afterEach(() => {
    delete process.env.PLAID_CLIENT_ID;
    delete process.env.PLAID_SECRET;
    delete process.env.PLAID_ENV;
  });

  it("fails fast when credentials are missing", async () => {
    delete process.env.PLAID_CLIENT_ID;
    await expect(import("@/lib/plaid")).rejects.toThrow(
      "PLAID_CLIENT_ID and PLAID_SECRET must be set",
    );
  });

  it("passes configured headers to PlaidApi", async () => {
    const { plaidClient } = await import("@/lib/plaid");

    expect(configurationMock).toHaveBeenCalledWith({
      basePath: "https://sandbox.plaid.example",
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": "client-id",
          "PLAID-SECRET": "secret",
        },
      },
    });
    expect(plaidApiMock).toHaveBeenCalledWith({
      basePath: "https://sandbox.plaid.example",
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": "client-id",
          "PLAID-SECRET": "secret",
        },
      },
    });
    expect(plaidClient).toEqual({
      config: {
        basePath: "https://sandbox.plaid.example",
        baseOptions: {
          headers: {
            "PLAID-CLIENT-ID": "client-id",
            "PLAID-SECRET": "secret",
          },
        },
      },
    });
  });
});
