// src/lib/db.ts
import { env } from '@/lib/env';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;