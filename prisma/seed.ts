/**
 * Jinni database seed.
 *
 * Safety: the seed refuses to run against NODE_ENV=production.
 *
 * Default behavior: logs a message and exits without touching any data.
 * No demo users, no fake accounts, no hardcoded credentials, no data wipe.
 *
 * Optional: set SEED_SAMPLE_CURRICULUM=1 to seed a few non-user reference
 * rows (Subject / Topic catalog samples) with no class or teacher links.
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env"), quiet: true });
loadEnv({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run the demo seed against production.");
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL / DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seedSampleCurriculum() {
  console.log("SEED_SAMPLE_CURRICULUM=1 — seeding non-user reference data…");

  const mathTopics = [
    { name: "Linear Equations", orderIndex: 1, description: "Solving equations in one variable" },
    { name: "Quadratic Equations", orderIndex: 2, description: "Roots, factoring, discriminant" },
    { name: "Coordinate Geometry", orderIndex: 3, description: "Lines, slope, distance" },
  ];

  const physicsTopics = [
    { name: "Motion", orderIndex: 1, description: "Speed, velocity, acceleration" },
    { name: "Force and Laws of Motion", orderIndex: 2, description: "Newton's laws" },
  ];

  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Mathematics",
        code: "MATH-REF",
        description: "Sample reference catalog for mathematics topics.",
        topics: { create: mathTopics },
      },
      include: { topics: true },
    }),
    prisma.subject.create({
      data: {
        name: "Physics",
        code: "PHY-REF",
        description: "Sample reference catalog for physics topics.",
        topics: { create: physicsTopics },
      },
      include: { topics: true },
    }),
  ]);

  const counts = {
    subjects: subjects.length,
    topics: subjects.reduce((sum, s) => sum + s.topics.length, 0),
  };

  console.log(`Seeded sample curriculum: ${counts.subjects} subjects, ${counts.topics} topics.`);
  for (const s of subjects) {
    console.log(`  - ${s.name} (${s.code}): ${s.topics.map((t) => t.name).join(", ")}`);
  }
}

async function main() {
  console.log(
    "Jinni seed: no demo users are created. Use the UI to register real accounts. " +
    "Set SEED_SAMPLE_CURRICULUM=1 to seed a sample class/subject structure (without demo users).",
  );

  if (process.env.SEED_SAMPLE_CURRICULUM === "1") {
    await seedSampleCurriculum();
  } else {
    console.log(
      "SEED_SAMPLE_CURRICULUM is not set — no rows were inserted. Existing data is untouched.",
    );
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
