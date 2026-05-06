import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaHash: string | undefined;
};

// Each schema change bumps this constant (update after db:generate).
// When it differs from the cached value the singleton is recreated.
const SCHEMA_VERSION = "v8"; // Reporte.personalResponsableId added

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prismaSchemaHash !== SCHEMA_VERSION
) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaHash = SCHEMA_VERSION;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
