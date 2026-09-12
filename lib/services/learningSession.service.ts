import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import { assertCanManageClass, assertCanManageSubject } from "@/lib/auth/access";
import type {
  createLearningSessionSchema,
  listLearningSessionsQuerySchema,
} from "@/lib/validation/learningSession";

const sessionSelect = {
  id: true,
  teacherId: true,
  classId: true,
  subjectId: true,
  topicId: true,
  title: true,
  material: true,
  gradeLevel: true,
  createdAt: true,
  updatedAt: true,
  class: { select: { id: true, name: true, section: true } },
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
  _count: { select: { quizzes: true } },
} as const;

/**
 * Records what a teacher taught. This is the entry point to the whole loop:
 * material captured here is what Gemini grounds every generated question in.
 */
export async function createLearningSession(
  actor: Actor & { teacherId: string },
  input: z.infer<typeof createLearningSessionSchema>,
) {
  if (input.classId) {
    await assertCanManageClass(actor, input.classId);
  }

  await assertCanManageSubject(actor, input.subjectId);

  if (input.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: input.topicId },
      select: { subjectId: true },
    });

    if (!topic) throw new ApiError("NOT_FOUND", "Topic not found");
    if (topic.subjectId !== input.subjectId) {
      throw new ApiError("BAD_REQUEST", "That topic belongs to another subject");
    }
  }

  return prisma.learningSession.create({
    data: { ...input, teacherId: actor.teacherId },
    select: sessionSelect,
  });
}

export async function listLearningSessions(
  actor: Actor & { teacherId: string },
  filters: z.infer<typeof listLearningSessionsQuerySchema>,
) {
  return prisma.learningSession.findMany({
    where: {
      teacherId: actor.teacherId,
      ...(filters.classId ? { classId: filters.classId } : {}),
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: sessionSelect,
  });
}

export async function getLearningSession(actor: Actor, sessionId: string) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    select: {
      ...sessionSelect,
      quizzes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          reviewStatus: true,
          questionCount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) throw new ApiError("NOT_FOUND", "Learning session not found");

  if (actor.role !== "TEACHER" || actor.teacherId !== session.teacherId) {
    throw new ApiError(
      "FORBIDDEN",
      "You do not own this learning session",
    );
  }

  return session;
}

export async function deleteLearningSession(actor: Actor, sessionId: string) {
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    select: { teacherId: true },
  });

  if (!session) throw new ApiError("NOT_FOUND", "Learning session not found");

  if (actor.role !== "TEACHER" || actor.teacherId !== session.teacherId) {
    throw new ApiError(
      "FORBIDDEN",
      "You do not own this learning session",
    );
  }

  await prisma.learningSession.delete({ where: { id: sessionId } });
  return { id: sessionId, deleted: true };
}
