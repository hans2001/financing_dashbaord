import type { AuthorizationResult } from "@/lib/family-auth";
import { vi } from "vitest";

type StandardFunction = (...args: unknown[]) => unknown;
type AnyMock = ReturnType<typeof vi.fn<StandardFunction>>;
type PrismaCollection = Record<string, AnyMock>;
type PrismaMock = {
  account: PrismaCollection;
  transaction: PrismaCollection;
  bankItem: PrismaCollection;
  user: PrismaCollection;
  savedView: PrismaCollection;
};
type PlaidClientMock = {
  transactionsGet: AnyMock;
  linkTokenCreate: AnyMock;
  itemPublicTokenExchange: AnyMock;
  itemGet: AnyMock;
  institutionsGetById: AnyMock;
  accountsGet: AnyMock;
  accountsBalanceGet: AnyMock;
};

const createMockFn = () => vi.fn<StandardFunction>();

export const authorizeRequestMock = vi.fn<(request: Request) => AuthorizationResult>();
export const ensureDemoUserMock = vi.fn<() => Promise<{ id: string }>>();
export const refreshAccountBalancesMock = createMockFn();

export const prismaMock: PrismaMock = {
  account: {
    findMany: createMockFn(),
    findFirst: createMockFn(),
    findUnique: createMockFn(),
    upsert: createMockFn(),
  },
  transaction: {
    findMany: createMockFn(),
    count: createMockFn(),
    aggregate: createMockFn(),
    groupBy: createMockFn(),
    findUnique: createMockFn(),
    upsert: createMockFn(),
    update: createMockFn(),
  },
  bankItem: {
    findMany: createMockFn(),
    upsert: createMockFn(),
    update: createMockFn(),
  },
  user: {
    upsert: createMockFn(),
    findMany: createMockFn(),
    update: createMockFn(),
    updateMany: createMockFn(),
  },
  savedView: {
    findUnique: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  },
};

export const plaidClientMock: PlaidClientMock = {
  transactionsGet: createMockFn(),
  linkTokenCreate: createMockFn(),
  itemPublicTokenExchange: createMockFn(),
  itemGet: createMockFn(),
  institutionsGetById: createMockFn(),
  accountsGet: createMockFn(),
  accountsBalanceGet: createMockFn(),
};

export function resetMocks() {
  authorizeRequestMock.mockReset();
  ensureDemoUserMock.mockReset();

  Object.values(prismaMock).forEach((collection) => {
    Object.values(collection).forEach((mock) => mock.mockReset());
  });

  Object.values(plaidClientMock).forEach((mock) => mock.mockReset());
  refreshAccountBalancesMock.mockReset();
}
