import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { isUniqueViolation } from "@/lib/api/prisma-errors";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleClassIds,
  assertCanAccessStudent,
  assertCanManageClass,
} from "@/lib/auth/access";
import {
  generateLessonQuiz,
  regenerateLessonQuestion,
} from "@/lib/ai/lessonQuizGenerator";
import type {
  assignQuizSchema,
  listQuizzesQuerySchema,
  updateQuizQuestionSchema,
  updateQuizSchema,
} from "@/lib/validation/quiz";

const questionSelect = {
  id: true,
  orderIndex: true,
  questionType: true,
  prompt: true,
  options: true,
  correctAnswer: true,
  explanation: true,
  conceptTag: true,
  difficulty: true,
  topicId: true,
} as const;

const quizSelect = {
  id: true,
  title: true,
  instructions: true,
  difficulty: true,
  questionType: true,
  questionCount: true,
  status: true,
  kind: true,
  reviewStatus: true,
  learningSessionId: true,
  createdByUserId: true,
  sourceAttemptId: true,
  targetConcepts: true,
  generatedBy: true,
  subjectId: true,
  topicId: true,
  createdAt: true,
  updatedAt: true,
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
  learningSession: {
    select: { id: true, title: true, classId: true, teacherId: true },
  },
} as const;

/** Loads a quiz and confirms the caller is the teacher who authored it. */
async function requireOwnedQuiz(actor: Actor, quizId: string) {
  const quiz = await prisma.practiceTest.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      createdByUserId: true,
      kind: true,
      reviewStatus: true,
      subjectId: true,
      topicId: true,
      title: true,
      difficulty: true,
      questionType: true,
      learningSession: { select: { teacherId: true, material: true, gradeLevel: true } },
    },
  });

  if (!quiz) throw new ApiError("NOT_FOUND", "Quiz not found");

  const ownerTeacherId = quiz.learningSession?.teacherId;

  if (
    actor.role !== "TEACHER" ||
    (quiz.createdByUserId !== actor.userId &&
      actor.teacherId !== ownerTeacherId)
  ) {
    throw new ApiError("FORBIDDEN", "You do not own this quiz");
  }

  return quiz;
}

/**
 * Generates a quiz from a learning session's material. The quiz starts in
 * PENDING_REVIEW so it is invisible to students until the teacher approves
 * it — Gemini's output is never trusted directly onto a student's screen.
 */
export async function generateQuizFromSession(
  actor: Actor & { teacherId: string },
  sessionId: string,
  count: number,
) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      teacherId: true,
      subjectId: true,
      topicId: true,
      title: true,
      material: true,
      gradeLevel: true,
      subject: { select: { name: true } },
      topic: { select: { name: true } },
    },
  });

  if (!session) throw new ApiError("NOT_FOUND", "Learning session not found");

  if (session.teacherId !== actor.teacherId) {
    throw new ApiError(
      "FORBIDDEN",
      "You do not own this learning session",
    );
  }

  const generated = await generateLessonQuiz({
    subjectName: session.subject.name,
    topicName: session.topic?.name ?? session.title,
    gradeLevel: session.gradeLevel,
    material: session.material,
    count,
  });

  const quiz = await prisma.practiceTest.create({
    data: {
      subjectId: session.subjectId,
      topicId: session.topicId,
      title: session.title,
      difficulty: "MEDIUM",
      questionType: "MCQ",
      questionCount: generated.questions.length,
      status: "COMPLETED",
      kind: "TEACHER_ASSIGNED",
      reviewStatus: "PENDING_REVIEW",
      learningSessionId: session.id,
      createdByUserId: actor.userId,
      generatedBy: generated.generatedBy,
      questions: {
        create: generated.questions.map((q, index) => ({
          orderIndex: index + 1,
          topicId: session.topicId,
          questionType: "MCQ",
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          conceptTag: q.conceptTag,
          difficulty: q.difficulty,
        })),
      },
    },
    select: {
      ...quizSelect,
      questions: { orderBy: { orderIndex: "asc" }, select: questionSelect },
    },
  });

  return {
    quiz,
    generatedBy: generated.generatedBy,
    ...(generated.fallbackReason
      ? { aiFallbackReason: generated.fallbackReason }
      : {}),
  };
}

/** The full quiz with its answer key, for the teacher's review screen. */
export async function getQuizForReview(actor: Actor, quizId: string) {
  await requireOwnedQuiz(actor, quizId);

  return prisma.practiceTest.findUniqueOrThrow({
    where: { id: quizId },
    select: {
      ...quizSelect,
      questions: { orderBy: { orderIndex: "asc" }, select: questionSelect },
    },
  });
}

export async function updateQuiz(
  actor: Actor,
  quizId: string,
  input: z.infer<typeof updateQuizSchema>,
) {
  await requireOwnedQuiz(actor, quizId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  return prisma.practiceTest.update({
    where: { id: quizId },
    data: input,
    select: quizSelect,
  });
}

/** Edits one question's text, options, answer, explanation or tagging. */
export async function updateQuizQuestion(
  actor: Actor,
  quizId: string,
  questionId: string,
  input: z.infer<typeof updateQuizQuestionSchema>,
) {
  await requireOwnedQuiz(actor, quizId);

  const question = await prisma.practiceQuestion.findUnique({
    where: { id: questionId },
    select: { practiceTestId: true },
  });

  if (!question || question.practiceTestId !== quizId) {
    throw new ApiError("NOT_FOUND", "Question not found on this quiz");
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  return prisma.practiceQuestion.update({
    where: { id: questionId },
    data: input,
    select: questionSelect,
  });
}

/** Regenerates one question in place, keeping its concept and position. */
export async function regenerateQuizQuestion(
  actor: Actor,
  quizId: string,
  questionId: string,
) {
  const quiz = await requireOwnedQuiz(actor, quizId);

  const question = await prisma.practiceQuestion.findUnique({
    where: { id: questionId },
    select: { practiceTestId: true, conceptTag: true, orderIndex: true },
  });

  if (!question || question.practiceTestId !== quizId) {
    throw new ApiError("NOT_FOUND", "Question not found on this quiz");
  }

  if (!quiz.learningSession) {
    throw new ApiError(
      "BAD_REQUEST",
      "This quiz has no lesson material to regenerate from",
    );
  }

  const subject = await prisma.subject.findUnique({
    where: { id: quiz.subjectId },
    select: { name: true },
  });
  const topic = quiz.topicId
    ? await prisma.topic.findUnique({
        where: { id: quiz.topicId },
        select: { name: true },
      })
    : null;

  const { question: regenerated, generatedBy } = await regenerateLessonQuestion(
    {
      subjectName: subject?.name ?? "",
      topicName: topic?.name ?? quiz.title,
      gradeLevel: quiz.learningSession.gradeLevel,
      material: quiz.learningSession.material,
      count: 1,
    },
    question.conceptTag ?? quiz.title,
  );

  const updated = await prisma.practiceQuestion.update({
    where: { id: questionId },
    data: {
      prompt: regenerated.prompt,
      options: regenerated.options,
      correctAnswer: regenerated.correctAnswer,
      explanation: regenerated.explanation,
      conceptTag: regenerated.conceptTag,
      difficulty: regenerated.difficulty,
    },
    select: questionSelect,
  });

  return { question: updated, generatedBy };
}

/** Regenerates the whole quiz from the same session, discarding old questions. */
export async function regenerateQuiz(actor: Actor, quizId: string) {
  const quiz = await requireOwnedQuiz(actor, quizId);

  if (!quiz.learningSession) {
    throw new ApiError(
      "BAD_REQUEST",
      "This quiz has no lesson material to regenerate from",
    );
  }

  const existingCount = await prisma.practiceQuestion.count({
    where: { practiceTestId: quizId },
  });

  const sessionRow = await prisma.practiceTest.findUniqueOrThrow({
    where: { id: quizId },
    select: {
      learningSession: {
        select: { material: true, gradeLevel: true, subject: { select: { name: true } }, topic: { select: { name: true } } },
      },
      subjectId: true,
      topicId: true,
    },
  });

  if (!sessionRow.learningSession) {
    throw new ApiError(
      "BAD_REQUEST",
      "This quiz has no lesson material to regenerate from",
    );
  }

  const generated = await generateLessonQuiz({
    subjectName: sessionRow.learningSession.subject.name,
    topicName: sessionRow.learningSession.topic?.name ?? quiz.title,
    gradeLevel: sessionRow.learningSession.gradeLevel,
    material: sessionRow.learningSession.material,
    count: existingCount || 10,
  });

  await prisma.$transaction([
    prisma.practiceQuestion.deleteMany({ where: { practiceTestId: quizId } }),
    prisma.practiceQuestion.createMany({
      data: generated.questions.map((q, index) => ({
        practiceTestId: quizId,
        orderIndex: index + 1,
        topicId: sessionRow.topicId,
        questionType: "MCQ",
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        conceptTag: q.conceptTag,
        difficulty: q.difficulty,
      })),
    }),
    prisma.practiceTest.update({
      where: { id: quizId },
      data: {
        questionCount: generated.questions.length,
        generatedBy: generated.generatedBy,
        reviewStatus: "PENDING_REVIEW",
      },
    }),
  ]);

  return getQuizForReview(actor, quizId);
}

/** Approves a quiz, making it visible to students once assigned. */
export async function approveQuiz(actor: Actor, quizId: string) {
  await requireOwnedQuiz(actor, quizId);

  const questionCount = await prisma.practiceQuestion.count({
    where: { practiceTestId: quizId },
  });

  if (questionCount === 0) {
    throw new ApiError("BAD_REQUEST", "A quiz needs at least one question");
  }

  return prisma.practiceTest.update({
    where: { id: quizId },
    data: { reviewStatus: "APPROVED" },
    select: quizSelect,
  });
}

/**
 * Assigns an approved quiz to a class, to named students, or both. Students
 * only ever see a quiz through an assignment row — creating the quiz alone
 * does not put it in front of anyone.
 */
export async function assignQuiz(
  actor: Actor,
  quizId: string,
  input: z.infer<typeof assignQuizSchema>,
) {
  const quiz = await requireOwnedQuiz(actor, quizId);

  if (quiz.reviewStatus !== "APPROVED") {
    throw new ApiError(
      "CONFLICT",
      "Approve this quiz before assigning it to students",
    );
  }

  if (input.classId) {
    await assertCanManageClass(actor, input.classId);
  }

  if (input.studentIds?.length) {
    for (const studentId of input.studentIds) {
      await assertCanAccessStudent(actor, studentId);
    }
  }

  const rows: { classId?: string; studentId?: string }[] = [];
  if (input.classId) rows.push({ classId: input.classId });
  for (const studentId of input.studentIds ?? []) rows.push({ studentId });

  try {
    await prisma.quizAssignment.createMany({
      data: rows.map((r) => ({
        quizId,
        ...r,
        assignedById: actor.userId,
        dueDate: input.dueDate,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError("CONFLICT", "This quiz is already assigned there");
    }
    throw error;
  }

  return prisma.quizAssignment.findMany({
    where: { quizId },
    select: {
      id: true,
      classId: true,
      studentId: true,
      dueDate: true,
      class: { select: { id: true, name: true, section: true } },
      student: {
        select: { id: true, user: { select: { name: true } } },
      },
    },
  });
}

/** Quizzes a teacher has authored, for their quiz-management list. */
export async function listTeacherQuizzes(
  actor: Actor & { teacherId: string },
  filters: z.infer<typeof listQuizzesQuerySchema>,
) {
  return prisma.practiceTest.findMany({
    where: {
      kind: "TEACHER_ASSIGNED",
      learningSession: { teacherId: actor.teacherId },
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.classId
        ? { assignments: { some: { classId: filters.classId } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { ...quizSelect, _count: { select: { assignments: true, attempts: true } } },
  });
}

/**
 * Quizzes visible to a student: approved and assigned to them directly or
 * through a class they are enrolled in.
 */
export async function listStudentQuizzes(actor: Actor & { studentId: string }) {
  const classIds = await accessibleClassIds(actor);

  return prisma.practiceTest.findMany({
    where: {
      reviewStatus: "APPROVED",
      kind: { in: ["TEACHER_ASSIGNED", "PERSONALIZED"] },
      OR: [
        { studentId: actor.studentId },
        {
          assignments: {
            some: {
              OR: [
                { studentId: actor.studentId },
                { classId: { in: classIds } },
              ],
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      ...quizSelect,
      attempts: {
        where: { studentId: actor.studentId },
        select: { id: true, status: true, score: true, percentage: true, attemptNumber: true },
        orderBy: { attemptNumber: "desc" },
      },
    },
  });
}
