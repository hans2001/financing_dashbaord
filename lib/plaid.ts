import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const PLAID_ENV = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  throw new Error("PLAID_CLIENT_ID and PLAID_SECRET must be set");
}

const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(config);
