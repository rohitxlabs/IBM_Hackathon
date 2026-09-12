import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js reads .env.local; the Prisma CLI does not. Load both so migrate,
// generate and seed see the same connection strings the app uses.
loadEnv({ path: path.resolve(process.cwd(), ".env") , quiet: true });
loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: true, quiet: true });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma Migrate needs a direct (non-pooled) connection.
    url: env("DIRECT_URL"),
  },
});
