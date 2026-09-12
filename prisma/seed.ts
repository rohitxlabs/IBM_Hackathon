/**
 * Demo data for local development and manual API testing.
 *
 * Safety: the seed refuses to run against NODE_ENV=production, and the demo
 * account password comes from SEED_PASSWORD (falling back to a well-known
 * development-only value). No production secret is ever hardcoded here.
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
import {
  Difficulty,
  ExamType,
  MistakeSource,
  PracticeTestStatus,
  QuestionType,
  Role,
  SubmissionStatus,
} from "../lib/generated/prisma/enums";
import bcrypt from "bcryptjs";

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

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "Jinni#Demo2024";
const ACADEMIC_YEAR = "2025-2026";

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function reset() {
  // Order matters only for models without a cascading parent above them.
  await prisma.practiceQuestion.deleteMany();
  await prisma.practiceTest.deleteMany();
  await prisma.mistake.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Seeding Jinni demo data…");
  await reset();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const createUser = (email: string, name: string, role: Role) =>
    prisma.user.create({ data: { email, name, role, passwordHash } });

  // --- Teachers -----------------------------------------------------------
  const teacherUsers = await Promise.all([
    createUser("anita.rao@jinni.test", "Anita Rao", Role.TEACHER),
    createUser("mark.silva@jinni.test", "Mark Silva", Role.TEACHER),
  ]);

  const [anita, mark] = await Promise.all([
    prisma.teacher.create({
      data: {
        userId: teacherUsers[0].id,
        employeeId: "TCH-1001",
        department: "Mathematics",
        bio: "Teaches algebra and geometry for grades 8-10.",
      },
    }),
    prisma.teacher.create({
      data: {
        userId: teacherUsers[1].id,
        employeeId: "TCH-1002",
        department: "Science",
        bio: "Physics and chemistry specialist.",
      },
    }),
  ]);

  // --- Students -----------------------------------------------------------
  const studentSeed = [
    { email: "riya.sharma@jinni.test", name: "Riya Sharma", roll: "STU-2401" },
    { email: "arjun.mehta@jinni.test", name: "Arjun Mehta", roll: "STU-2402" },
    { email: "leo.dsouza@jinni.test", name: "Leo D'Souza", roll: "STU-2403" },
  ];

  const students = [];
  for (const s of studentSeed) {
    const user = await createUser(s.email, s.name, Role.STUDENT);
    students.push(
      await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: s.roll,
          gradeLevel: 9,
          dateOfBirth: new Date("2011-06-15"),
        },
      }),
    );
  }
  const [riya, arjun, leo] = students;

  // --- Parents ------------------------------------------------------------
  const parentUsers = await Promise.all([
    createUser("sunita.sharma@jinni.test", "Sunita Sharma", Role.PARENT),
    createUser("vikram.mehta@jinni.test", "Vikram Mehta", Role.PARENT),
  ]);

  const [sunita, vikram] = await Promise.all([
    prisma.parent.create({
      data: { userId: parentUsers[0].id, phone: "+91-99000-11001", occupation: "Architect" },
    }),
    prisma.parent.create({
      data: { userId: parentUsers[1].id, phone: "+91-99000-11002", occupation: "Accountant" },
    }),
  ]);

  // --- Parent ↔ child links ----------------------------------------------
  await prisma.studentParent.createMany({
    data: [
      { studentId: riya.id, parentId: sunita.id, relationship: "MOTHER", isPrimary: true },
      { studentId: arjun.id, parentId: vikram.id, relationship: "FATHER", isPrimary: true },
      // Leo is a sibling of Arjun, so Vikram guards both children.
      { studentId: leo.id, parentId: vikram.id, relationship: "GUARDIAN", isPrimary: false },
    ],
  });

  // --- Classes ------------------------------------------------------------
  const class9A = await prisma.class.create({
    data: {
      name: "Grade 9",
      section: "A",
      academicYear: ACADEMIC_YEAR,
      gradeLevel: 9,
      teacherId: anita.id,
    },
  });

  const class9B = await prisma.class.create({
    data: {
      name: "Grade 9",
      section: "B",
      academicYear: ACADEMIC_YEAR,
      gradeLevel: 9,
      teacherId: mark.id,
    },
  });

  await prisma.classStudent.createMany({
    data: [
      { classId: class9A.id, studentId: riya.id },
      { classId: class9A.id, studentId: arjun.id },
      { classId: class9B.id, studentId: leo.id },
    ],
  });

  // --- Subjects + topics --------------------------------------------------
  const maths = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MATH9A",
      description: "Grade 9 mathematics",
      classId: class9A.id,
      teacherId: anita.id,
      topics: {
        create: [
          { name: "Linear Equations", orderIndex: 1, description: "Solving equations in one variable" },
          { name: "Quadratic Equations", orderIndex: 2, description: "Roots, factoring, discriminant" },
          { name: "Coordinate Geometry", orderIndex: 3, description: "Lines, slope, distance" },
        ],
      },
    },
    include: { topics: true },
  });

  const science = await prisma.subject.create({
    data: {
      name: "Physics",
      code: "PHY9B",
      description: "Grade 9 physics",
      classId: class9B.id,
      teacherId: mark.id,
      topics: {
        create: [
          { name: "Motion", orderIndex: 1, description: "Speed, velocity, acceleration" },
          { name: "Force and Laws of Motion", orderIndex: 2, description: "Newton's laws" },
        ],
      },
    },
    include: { topics: true },
  });

  const linearEq = maths.topics.find((t) => t.name === "Linear Equations")!;
  const quadratic = maths.topics.find((t) => t.name === "Quadratic Equations")!;
  const geometry = maths.topics.find((t) => t.name === "Coordinate Geometry")!;
  const motion = science.topics.find((t) => t.name === "Motion")!;

  // --- Assignments + submissions -----------------------------------------
  const algebraHw = await prisma.assignment.create({
    data: {
      title: "Linear Equations Worksheet",
      description: "Solve problems 1-15 from chapter 3 and show your working.",
      classId: class9A.id,
      subjectId: maths.id,
      topicId: linearEq.id,
      teacherId: anita.id,
      dueDate: daysFromNow(5),
      maxScore: 50,
    },
  });

  const quadraticHw = await prisma.assignment.create({
    data: {
      title: "Quadratic Roots Practice",
      description: "Find the roots of the ten quadratic equations provided.",
      classId: class9A.id,
      subjectId: maths.id,
      topicId: quadratic.id,
      teacherId: anita.id,
      dueDate: daysFromNow(-2),
      maxScore: 40,
    },
  });

  const motionHw = await prisma.assignment.create({
    data: {
      title: "Motion Graphs",
      description: "Plot distance-time graphs for the three scenarios.",
      classId: class9B.id,
      subjectId: science.id,
      topicId: motion.id,
      teacherId: mark.id,
      dueDate: daysFromNow(7),
      maxScore: 30,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: quadraticHw.id,
      studentId: riya.id,
      content: "Answers attached; used the quadratic formula throughout.",
      status: SubmissionStatus.GRADED,
      submittedAt: daysFromNow(-3),
      score: 34,
      feedback: "Good work. Watch the sign of the discriminant in Q7.",
      gradedAt: daysFromNow(-1),
      gradedById: teacherUsers[0].id,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: quadraticHw.id,
      studentId: arjun.id,
      content: "Completed 8 of 10 questions.",
      status: SubmissionStatus.LATE,
      submittedAt: daysFromNow(-1),
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: algebraHw.id,
      studentId: riya.id,
      content: "Draft answers for problems 1-15.",
      status: SubmissionStatus.SUBMITTED,
    },
  });

  // --- Exams + results ----------------------------------------------------
  const midterm = await prisma.exam.create({
    data: {
      title: "Mathematics Midterm",
      description: "Covers linear and quadratic equations.",
      classId: class9A.id,
      subjectId: maths.id,
      teacherId: anita.id,
      examType: ExamType.MIDTERM,
      examDate: daysFromNow(-10),
      durationMinutes: 90,
      maxScore: 100,
    },
  });

  const upcomingQuiz = await prisma.exam.create({
    data: {
      title: "Coordinate Geometry Quiz",
      description: "Short quiz on slope and distance formulae.",
      classId: class9A.id,
      subjectId: maths.id,
      topicId: geometry.id,
      teacherId: anita.id,
      examType: ExamType.QUIZ,
      examDate: daysFromNow(12),
      durationMinutes: 30,
      maxScore: 20,
    },
  });

  const physicsTest = await prisma.exam.create({
    data: {
      title: "Physics Unit Test 1",
      classId: class9B.id,
      subjectId: science.id,
      teacherId: mark.id,
      examType: ExamType.UNIT_TEST,
      examDate: daysFromNow(-5),
      maxScore: 50,
    },
  });

  await prisma.examResult.createMany({
    data: [
      {
        examId: midterm.id,
        studentId: riya.id,
        score: 82,
        grade: "A",
        remarks: "Strong on linear equations.",
        recordedById: teacherUsers[0].id,
      },
      {
        examId: midterm.id,
        studentId: arjun.id,
        score: 54,
        grade: "C",
        remarks: "Needs practice with quadratics.",
        recordedById: teacherUsers[0].id,
      },
      {
        examId: physicsTest.id,
        studentId: leo.id,
        score: 38,
        grade: "B",
        recordedById: teacherUsers[1].id,
      },
    ],
  });

  // --- Mistakes (input for weak-topic detection) --------------------------
  await prisma.mistake.createMany({
    data: [
      {
        studentId: arjun.id,
        subjectId: maths.id,
        topicId: quadratic.id,
        question: "Find the roots of x^2 - 5x + 6 = 0.",
        studentAnswer: "x = 1, x = 6",
        correctAnswer: "x = 2, x = 3",
        explanation: "Factor as (x-2)(x-3); the factors must multiply to 6 and add to 5.",
        source: MistakeSource.EXAM,
        sourceId: midterm.id,
      },
      {
        studentId: arjun.id,
        subjectId: maths.id,
        topicId: quadratic.id,
        question: "What is the discriminant of 2x^2 + 3x + 5?",
        studentAnswer: "9",
        correctAnswer: "-31",
        explanation: "b^2 - 4ac = 9 - 40 = -31, so the roots are complex.",
        source: MistakeSource.ASSIGNMENT,
        sourceId: quadraticHw.id,
      },
      {
        studentId: arjun.id,
        subjectId: maths.id,
        topicId: quadratic.id,
        question: "Solve x^2 = 16.",
        studentAnswer: "x = 4",
        correctAnswer: "x = 4 or x = -4",
        explanation: "A square root yields both a positive and a negative value.",
        source: MistakeSource.PRACTICE,
      },
      {
        studentId: arjun.id,
        subjectId: maths.id,
        topicId: linearEq.id,
        question: "Solve 3x + 9 = 0.",
        studentAnswer: "x = 3",
        correctAnswer: "x = -3",
        explanation: "Subtract 9 then divide by 3; the sign flips.",
        source: MistakeSource.SELF_REPORTED,
      },
      {
        studentId: riya.id,
        subjectId: maths.id,
        topicId: geometry.id,
        question: "Distance between (0,0) and (3,4)?",
        studentAnswer: "7",
        correctAnswer: "5",
        explanation: "Use sqrt(x^2 + y^2) = sqrt(9 + 16) = 5, not the sum of coordinates.",
        source: MistakeSource.PRACTICE,
      },
      {
        studentId: leo.id,
        subjectId: science.id,
        topicId: motion.id,
        question: "A car travels 60 km in 2 h. What is its average speed?",
        studentAnswer: "120 km/h",
        correctAnswer: "30 km/h",
        explanation: "Average speed is distance divided by time, not multiplied.",
        source: MistakeSource.EXAM,
        sourceId: physicsTest.id,
      },
    ],
  });

  // --- Practice tests + questions ----------------------------------------
  const completedTest = await prisma.practiceTest.create({
    data: {
      studentId: arjun.id,
      subjectId: maths.id,
      topicId: quadratic.id,
      title: "Quadratic Equations — targeted practice",
      difficulty: Difficulty.MEDIUM,
      questionType: QuestionType.MCQ,
      questionCount: 3,
      status: PracticeTestStatus.COMPLETED,
      score: 2,
      totalScore: 3,
      startedAt: daysFromNow(-2),
      completedAt: daysFromNow(-2),
      generatedBy: "mock",
      questions: {
        create: [
          {
            orderIndex: 1,
            topicId: quadratic.id,
            questionType: QuestionType.MCQ,
            prompt: "What are the roots of x^2 - 7x + 12 = 0?",
            options: ["3 and 4", "2 and 6", "-3 and -4", "1 and 12"],
            correctAnswer: "3 and 4",
            studentAnswer: "3 and 4",
            isCorrect: true,
          },
          {
            orderIndex: 2,
            topicId: quadratic.id,
            questionType: QuestionType.MCQ,
            prompt: "The discriminant of x^2 + 2x + 5 is:",
            options: ["-16", "16", "4", "24"],
            correctAnswer: "-16",
            studentAnswer: "16",
            isCorrect: false,
            explanation: "b^2 - 4ac = 4 - 20 = -16; subtract 4ac rather than adding it.",
          },
          {
            orderIndex: 3,
            topicId: quadratic.id,
            questionType: QuestionType.TRUE_FALSE,
            prompt: "A quadratic with a negative discriminant has two real roots.",
            options: ["True", "False"],
            correctAnswer: "False",
            studentAnswer: "False",
            isCorrect: true,
          },
        ],
      },
    },
  });

  await prisma.practiceTest.create({
    data: {
      studentId: riya.id,
      subjectId: maths.id,
      topicId: geometry.id,
      title: "Coordinate Geometry warm-up",
      difficulty: Difficulty.EASY,
      questionType: QuestionType.MCQ,
      questionCount: 2,
      status: PracticeTestStatus.DRAFT,
      generatedBy: "mock",
      questions: {
        create: [
          {
            orderIndex: 1,
            topicId: geometry.id,
            questionType: QuestionType.MCQ,
            prompt: "The distance between (1,2) and (4,6) is:",
            options: ["5", "7", "3", "25"],
            correctAnswer: "5",
          },
          {
            orderIndex: 2,
            topicId: geometry.id,
            questionType: QuestionType.MCQ,
            prompt: "The slope of the line through (0,0) and (2,4) is:",
            options: ["2", "0.5", "4", "-2"],
            correctAnswer: "2",
          },
        ],
      },
    },
  });

  const counts = {
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    teachers: await prisma.teacher.count(),
    parents: await prisma.parent.count(),
    studentParents: await prisma.studentParent.count(),
    classes: await prisma.class.count(),
    classStudents: await prisma.classStudent.count(),
    subjects: await prisma.subject.count(),
    topics: await prisma.topic.count(),
    assignments: await prisma.assignment.count(),
    submissions: await prisma.submission.count(),
    exams: await prisma.exam.count(),
    examResults: await prisma.examResult.count(),
    mistakes: await prisma.mistake.count(),
    practiceTests: await prisma.practiceTest.count(),
    practiceQuestions: await prisma.practiceQuestion.count(),
  };

  console.table(counts);
  console.log(`Demo accounts share the password: ${DEMO_PASSWORD}`);
  console.log(`Seeded practice test: ${completedTest.title}`);
  console.log(`Upcoming exam: ${upcomingQuiz.title}`);
  console.log(`Assignments seeded: ${algebraHw.title}, ${quadraticHw.title}, ${motionHw.title}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
