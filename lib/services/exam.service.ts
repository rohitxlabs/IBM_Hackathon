import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { isUniqueViolation } from "@/lib/api/prisma-errors";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleClassIds,
  accessibleStudentIds,
  assertCanAccessStudent,
  assertCanManageClass,
  assertCanViewClass,
} from "@/lib/auth/access";
import {
  classAudience,
  notify,
  studentAudience,
} from "@/lib/services/notification.service";
import type {
  createExamSchema,
  listExamsQuerySchema,
  listResultsQuerySchema,
  recordExamResultsSchema,
  updateExamSchema,
} from "@/lib/validation/academic";

const examSelect = {
  id: true,
  title: true,
  description: true,
  examType: true,
  examDate: true,
  durationMinutes: true,
  maxScore: true,
  createdAt: true,
  updatedAt: true,
  classId: true,
  subjectId: true,
  topicId: true,
  teacherId: true,
  class: { select: { id: true, name: true, section: true } },
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
  teacher: { select: { id: true, user: { select: { id: true, name: true } } } },
} as const;

const resultSelect = {
  id: true,
  examId: true,
  studentId: true,
  score: true,
  grade: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function requireOwnedExam(actor: Actor, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, teacherId: true, classId: true, maxScore: true },
  });

  if (!exam) throw new ApiError("NOT_FOUND", "Exam not found");

  if (actor.role !== "TEACHER" || actor.teacherId !== exam.teacherId) {
    throw new ApiError("FORBIDDEN", "You do not own this exam");
  }

  return exam;
}

/* ----------------------------- teacher side ----------------------------- */

export async function createExam(
  actor: Actor & { teacherId: string },
  input: z.infer<typeof createExamSchema>,
) {
  await assertCanManageClass(actor, input.classId);

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: { id: true, classId: true, teacherId: true },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");

  if (
    subject.classId !== null &&
    subject.classId !== input.classId &&
    subject.teacherId !== actor.teacherId
  ) {
    throw new ApiError("FORBIDDEN", "That subject does not belong to this class");
  }

  const exam = await prisma.exam.create({
    data: { ...input, teacherId: actor.teacherId },
    select: examSelect,
  });

  await notify({
    userIds: await classAudience(exam.classId),
    type: "EXAM",
    title: `Exam scheduled: ${exam.title}`,
    body: `${exam.subject.name} on ${exam.examDate.toDateString()}`,
    link: `/exams/${exam.id}`,
  });

  return exam;
}

export async function updateExam(
  actor: Actor,
  examId: string,
  input: z.infer<typeof updateExamSchema>,
) {
  await requireOwnedExam(actor, examId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  return prisma.exam.update({
    where: { id: examId },
    data: input,
    select: examSelect,
  });
}

export async function deleteExam(actor: Actor, examId: string) {
  await requireOwnedExam(actor, examId);
  await prisma.exam.delete({ where: { id: examId } });
  return { id: examId, deleted: true };
}

/** Records or updates results for several students at once. */
export async function recordExamResults(
  actor: Actor,
  examId: string,
  input: z.infer<typeof recordExamResultsSchema>,
) {
  const exam = await requireOwnedExam(actor, examId);

  const studentIds = input.results.map((r) => r.studentId);
  const uniqueIds = new Set(studentIds);

  if (uniqueIds.size !== studentIds.length) {
    throw new ApiError("BAD_REQUEST", "A student appears more than once");
  }

  const overMax = input.results.find((r) => r.score > exam.maxScore);
  if (overMax) {
    throw new ApiError(
      "BAD_REQUEST",
      `Score cannot exceed the maximum of ${exam.maxScore}`,
    );
  }

  // Every student must actually sit in the class the exam belongs to.
  const enrolled = await prisma.classStudent.findMany({
    where: { classId: exam.classId, studentId: { in: studentIds } },
    select: { studentId: true },
  });
  const enrolledIds = new Set(enrolled.map((e) => e.studentId));
  const outsider = studentIds.find((id) => !enrolledIds.has(id));

  if (outsider) {
    throw new ApiError(
      "BAD_REQUEST",
      "One or more students are not enrolled in this class",
    );
  }

  try {
    const recorded = await prisma.$transaction(
      input.results.map((r) =>
        prisma.examResult.upsert({
          where: { examId_studentId: { examId, studentId: r.studentId } },
          create: {
            examId,
            studentId: r.studentId,
            score: r.score,
            grade: r.grade,
            remarks: r.remarks,
            recordedById: actor.userId,
          },
          update: {
            score: r.score,
            grade: r.grade,
            remarks: r.remarks,
            recordedById: actor.userId,
          },
          select: resultSelect,
        }),
      ),
    );

    for (const result of recorded) {
      await notify({
        userIds: await studentAudience(result.studentId),
        type: "GRADE",
        title: "Exam result published",
        body: `Score: ${result.score} out of ${exam.maxScore}`,
        link: `/exams/${examId}`,
      });
    }

    return recorded;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError("CONFLICT", "A result for this student already exists");
    }
    throw error;
  }
}

/* ----------------------------- shared reads ----------------------------- */

export async function listExams(
  actor: Actor,
  filters: z.infer<typeof listExamsQuerySchema>,
) {
  let classIds = await accessibleClassIds(actor);

  if (filters.classId) {
    await assertCanViewClass(actor, filters.classId);
    classIds = [filters.classId];
  }

  let studentId: string | null = null;

  if (actor.role === "STUDENT") {
    studentId = actor.studentId;
  } else if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
    studentId = filters.studentId;
  }

  if (studentId && actor.role !== "TEACHER") {
    const enrolments = await prisma.classStudent.findMany({
      where: { studentId, classId: { in: classIds } },
      select: { classId: true },
    });
    classIds = enrolments.map((e) => e.classId);
  }

  const now = new Date();

  return prisma.exam.findMany({
    where: {
      classId: { in: classIds },
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.scope === "UPCOMING" ? { examDate: { gte: now } } : {}),
      ...(filters.scope === "PAST" ? { examDate: { lt: now } } : {}),
    },
    orderBy: { examDate: filters.scope === "PAST" ? "desc" : "asc" },
    select: {
      ...examSelect,
      ...(studentId
        ? { results: { where: { studentId }, select: resultSelect } }
        : { _count: { select: { results: true } } }),
    },
  });
}

export async function getExam(actor: Actor, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: examSelect,
  });

  if (!exam) throw new ApiError("NOT_FOUND", "Exam not found");

  const isOwner = actor.role === "TEACHER" && actor.teacherId === exam.teacherId;

  if (!isOwner) {
    await assertCanViewClass(actor, exam.classId);
  }

  if (actor.role === "STUDENT" && actor.studentId) {
    const result = await prisma.examResult.findUnique({
      where: { examId_studentId: { examId, studentId: actor.studentId } },
      select: resultSelect,
    });
    return { ...exam, result };
  }

  return exam;
}

/**
 * Results for one exam. A teacher who owns the exam sees the whole class;
 * students and parents see only the rows they are entitled to.
 */
export async function listExamResults(actor: Actor, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, teacherId: true, classId: true, maxScore: true },
  });

  if (!exam) throw new ApiError("NOT_FOUND", "Exam not found");

  const isOwner = actor.role === "TEACHER" && actor.teacherId === exam.teacherId;

  if (!isOwner) {
    await assertCanViewClass(actor, exam.classId);
  }

  const allowedStudentIds = isOwner ? null : await accessibleStudentIds(actor);

  return prisma.examResult.findMany({
    where: {
      examId,
      ...(allowedStudentIds ? { studentId: { in: allowedStudentIds } } : {}),
    },
    orderBy: { score: "desc" },
    select: {
      ...resultSelect,
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
}

/** A student's results across exams, readable by them, their parent or teacher. */
export async function listStudentResults(
  actor: Actor,
  filters: z.infer<typeof listResultsQuerySchema>,
) {
  let studentIds: string[];

  if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
    studentIds = [filters.studentId];
  } else {
    studentIds = await accessibleStudentIds(actor);
  }

  return prisma.examResult.findMany({
    where: {
      studentId: { in: studentIds },
      ...(filters.subjectId ? { exam: { subjectId: filters.subjectId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      ...resultSelect,
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: { select: { id: true, name: true } },
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          examType: true,
          examDate: true,
          maxScore: true,
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
}
