/**
 * Prisma Client Singleton
 * 
 * WHY A SINGLETON?
 * In development, Next.js hot-reloads your code frequently. Each reload would
 * create a NEW Prisma Client instance (and a new database connection).
 * This quickly exhausts your database's connection limit.
 * 
 * SOLUTION: Store the client on `globalThis` so it persists across hot reloads.
 * In production, this just creates one client normally.
 */

import { PrismaClient } from "@prisma/client";

// Extend the global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse existing client or create a new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, save the client to globalThis so it survives hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
