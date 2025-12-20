import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const PLAID_ENV = (process.env.PLAID_ENV ?? "production") as keyof typeof PlaidEnvironments;

let cachedPlaidClient: PlaidApi | null = null;

export const getPlaidClient = () => {
  if (cachedPlaidClient) {
    return cachedPlaidClient;
  }

  const plaidClientId = process.env.PLAID_CLIENT_ID;
  const plaidSecret = process.env.PLAID_SECRET;

  if (!plaidClientId || !plaidSecret) {
    throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
  }

  const config = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": plaidClientId,
        "PLAID-SECRET": plaidSecret,
      },
    },
  });

  cachedPlaidClient = new PlaidApi(config);
  return cachedPlaidClient;
};
