import { prisma } from "./prisma";

export const DEMO_USER_ID = "demo-user";

export async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, displayName: "Family" },
  });
}
