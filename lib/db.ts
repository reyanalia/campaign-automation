import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaNeonHttp(url, {});
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
