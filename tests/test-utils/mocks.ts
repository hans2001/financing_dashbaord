import type { AuthorizationResult } from "@/lib/family-auth";
import { vi } from "vitest";

type StandardFunction = (...args: unknown[]) => unknown;
type AnyMock = ReturnType<typeof vi.fn<StandardFunction>>;
type PrismaCollection = Record<string, AnyMock>;
type PlaidClientCollection = Record<string, AnyMock>;

const createMockFn = () => vi.fn<StandardFunction>();

export const authorizeRequestMock = vi.fn<(request: Request) => AuthorizationResult>();
export const ensureDemoUserMock = vi.fn<() => Promise<{ id: string }>>();

export const prismaMock: Record<string, PrismaCollection> = {
  account: {
    findMany: createMockFn(),
    findFirst: createMockFn(),
    findUnique: createMockFn(),
    upsert: createMockFn(),
  },
  transaction: {
    findMany: createMockFn(),
    count: createMockFn(),
    findUnique: createMockFn(),
    upsert: createMockFn(),
    update: createMockFn(),
  },
  bankItem: {
    findMany: createMockFn(),
    upsert: createMockFn(),
  },
  user: {
    upsert: createMockFn(),
  },
};

export const plaidClientMock: PlaidClientCollection = {
  transactionsGet: createMockFn(),
  linkTokenCreate: createMockFn(),
  itemPublicTokenExchange: createMockFn(),
  itemGet: createMockFn(),
  institutionsGetById: createMockFn(),
  accountsGet: createMockFn(),
};

export function resetMocks() {
  authorizeRequestMock.mockReset();
  ensureDemoUserMock.mockReset();

  Object.values(prismaMock).forEach((collection) => {
    Object.values(collection).forEach((mock) => mock.mockReset());
  });

  Object.values(plaidClientMock).forEach((mock) => mock.mockReset());
}
