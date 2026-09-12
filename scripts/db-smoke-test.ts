/**
 * Minimal database smoke test for Phase 1.
 *
 * Verifies connection, table presence, seeded relationships, unique
 * constraints and cascade behaviour. Run with: npm run test:db
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

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL / DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const EXPECTED_TABLES = [
  "users",
  "students",
  "teachers",
  "parents",
  "student_parents",
  "classes",
  "class_students",
  "subjects",
  "topics",
  "assignments",
  "submissions",
  "exams",
  "exam_results",
  "mistakes",
  "practice_tests",
  "practice_questions",
];

let failures = 0;

function check(name: string, passed: boolean, detail = "") {
  if (passed) {
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("\n1. Connection");
  const [{ ok }] = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
  check("SELECT 1 reaches PostgreSQL", ok === 1);

  console.log("\n2. Tables");
  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  const present = new Set(rows.map((r) => r.table_name));
  for (const table of EXPECTED_TABLES) {
    check(`table ${table}`, present.has(table));
  }
  check(
    "16 core tables created",
    EXPECTED_TABLES.every((t) => present.has(t)),
    `${EXPECTED_TABLES.filter((t) => present.has(t)).length}/16`,
  );

  console.log("\n3. Seeded relationships");
  const student = await prisma.student.findFirst({
    where: { rollNumber: "STU-2402" },
    include: {
      user: true,
      parents: { include: { parent: { include: { user: true } } } },
      classes: { include: { class: true } },
      submissions: { include: { assignment: true } },
      examResults: { include: { exam: true } },
      mistakes: { include: { topic: true } },
      practiceTests: { include: { questions: true } },
    },
  });
  check("demo student exists", Boolean(student), student?.user.name);
  check("student → parent link", (student?.parents.length ?? 0) > 0);
  check("student → class enrolment", (student?.classes.length ?? 0) > 0);
  check("student → submissions", (student?.submissions.length ?? 0) > 0);
  check("student → exam results", (student?.examResults.length ?? 0) > 0);
  check("student → mistakes", (student?.mistakes.length ?? 0) >= 3);
  check(
    "practice test → questions",
    (student?.practiceTests[0]?.questions.length ?? 0) > 0,
  );

  console.log("\n4. Constraints");
  const link = student!.parents[0];
  try {
    await prisma.studentParent.create({
      data: { studentId: link.studentId, parentId: link.parentId },
    });
    check("unique(studentId, parentId) enforced", false, "duplicate accepted");
  } catch {
    check("unique(studentId, parentId) enforced", true);
  }

  try {
    await prisma.user.create({
      data: {
        email: student!.user.email,
        name: "Duplicate",
        role: "STUDENT",
        passwordHash: "x",
      },
    });
    check("unique(users.email) enforced", false, "duplicate accepted");
  } catch {
    check("unique(users.email) enforced", true);
  }

  console.log("\n5. Cascade behaviour (rolled back)");
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: `cascade-${Date.now()}@jinni.test`,
          name: "Cascade Probe",
          role: "STUDENT",
          passwordHash: "x",
        },
      });
      const probe = await tx.student.create({
        data: {
          userId: user.id,
          rollNumber: `TMP-${Date.now()}`,
          gradeLevel: 9,
        },
      });
      await tx.user.delete({ where: { id: user.id } });
      const remaining = await tx.student.findUnique({ where: { id: probe.id } });
      check("deleting a user cascades to its student row", remaining === null);
      throw new Error("ROLLBACK");
    });
  } catch (error) {
    if ((error as Error).message !== "ROLLBACK") throw error;
  }

  console.log(
    failures === 0
      ? "\nAll database checks passed.\n"
      : `\n${failures} check(s) failed.\n`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error("Smoke test crashed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
