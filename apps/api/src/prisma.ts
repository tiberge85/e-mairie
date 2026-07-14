import { PrismaClient } from '@prisma/client';

/**
 * Client Prisma unique pour tout le process. En dev, `tsx watch` recharge le
 * module ; on réutilise l'instance accrochée à `globalThis` pour ne pas ouvrir
 * une nouvelle pool de connexions à chaque rechargement.
 */
const globalPourPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalPourPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalPourPrisma.prisma = prisma;
}
