import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7 connects through a driver adapter. The pooled DATABASE_URL is used
// at runtime; prisma.config.ts points Migrate at the direct DIRECT_URL.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const TRANSIENT_PATTERNS = [
  "P1001", // Prisma: can't reach database server
  "P1017", // Prisma: server has closed the connection
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNRESET",
  "ETIMEDOUT",
  "Connection terminated",
];

function isTransient(error: unknown): boolean {
  const text =
    error instanceof Error
      ? `${(error as { code?: string }).code ?? ""} ${error.message}`
      : String(error);
  return TRANSIENT_PATTERNS.some((pattern) => text.includes(pattern));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // Keep a warm pool so a DNS or network blip does not hit every request.
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  // Hosted Postgres occasionally refuses a brand new connection (DNS blips,
  // pooler restarts). Retry those transient failures instead of surfacing a
  // 500 to the client. Genuine query errors are rethrown immediately.
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            if (!isTransient(error)) throw error;
            lastError = error;
            await wait(150 * 2 ** attempt);
          }
        }

        throw lastError;
      },
    },
  });
}

export type AppPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Avoid exhausting connections through Next.js hot reloads in development.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
