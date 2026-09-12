import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig, type PrismaConfig } from "prisma/config";

loadEnv({ path: path.resolve(process.cwd(), ".env"), quiet: true });
loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: true, quiet: true });

type ExtendedPrismaConfig = PrismaConfig & {
  datasource?: {
    url: string;
  };
  migrations?: PrismaConfig["migrations"] & {
    seed?: string;
  };
};

const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

const config: ExtendedPrismaConfig = {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrl,
  },
};

export default defineConfig(config as PrismaConfig);
