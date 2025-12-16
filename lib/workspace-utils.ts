import { prisma } from "@/lib/prisma";

export async function ensureFamilyMember(id: string, displayName?: string) {
  return prisma.user.upsert({
    where: { id },
    update: displayName ? { displayName } : {},
    create: { id, displayName },
  });
}
