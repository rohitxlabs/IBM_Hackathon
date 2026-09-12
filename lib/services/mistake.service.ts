import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleStudentIds,
  assertCanAccessStudent,
  assertCanViewSubject,
} from "@/lib/auth/access";
import type {
  createMistakeSchema,
  listMistakesQuerySchema,
} from "@/lib/validation/learning";

const mistakeSelect = {
  id: true,
  studentId: true,
  subjectId: true,
  topicId: true,
  question: true,
  studentAnswer: true,
  correctAnswer: true,
  explanation: true,
  source: true,
  sourceId: true,
  createdAt: true,
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
} as const;

/**
 * Records a mistake. A student records their own; a teacher may record one for
 * a student in their class. Parents never write academic records.
 */
export async function recordMistake(
  actor: Actor,
  input: z.infer<typeof createMistakeSchema>,
) {
  const studentId =
    actor.role === "STUDENT" ? actor.studentId : (input.studentId ?? null);

  if (!studentId) {
    throw new ApiError("BAD_REQUEST", "studentId is required");
  }

  if (actor.role === "PARENT") {
    throw new ApiError("FORBIDDEN", "Parents cannot record mistakes");
  }

  await assertCanAccessStudent(actor, studentId);
  await assertCanViewSubject(actor, input.subjectId);

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

  const { studentId: _ignored, ...rest } = input;
  void _ignored;

  return prisma.mistake.create({
    data: { ...rest, studentId },
    select: mistakeSelect,
  });
}

export async function listMistakes(
  actor: Actor,
  filters: z.infer<typeof listMistakesQuerySchema>,
) {
  let studentIds: string[];

  if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
    studentIds = [filters.studentId];
  } else {
    studentIds = await accessibleStudentIds(actor);
  }

  const where = {
    studentId: { in: studentIds },
    ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
    ...(filters.topicId ? { topicId: filters.topicId } : {}),
    ...(filters.source ? { source: filters.source } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  };

  if (filters.groupBy === "NONE") {
    return {
      mistakes: await prisma.mistake.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit,
        select: mistakeSelect,
      }),
    };
  }

  const groups = await prisma.mistake.groupBy({
    by: filters.groupBy === "TOPIC" ? ["topicId", "subjectId"] : ["subjectId"],
    where,
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
  });

  const topicIds = groups
    .map((g) => (g as { topicId?: string | null }).topicId)
    .filter((id): id is string => Boolean(id));

  const subjectIds = groups.map((g) => g.subjectId);

  const [topics, subjects] = await Promise.all([
    topicIds.length
      ? prisma.topic.findMany({
          where: { id: { in: topicIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true, code: true },
    }),
  ]);

  const topicById = new Map(topics.map((t) => [t.id, t]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  return {
    groups: groups.map((group) => {
      const topicId = (group as { topicId?: string | null }).topicId ?? null;

      return {
        subjectId: group.subjectId,
        subject: subjectById.get(group.subjectId) ?? null,
        ...(filters.groupBy === "TOPIC"
          ? { topicId, topic: topicId ? (topicById.get(topicId) ?? null) : null }
          : {}),
        count: group._count._all,
      };
    }),
  };
}

export async function deleteMistake(actor: Actor, mistakeId: string) {
  const mistake = await prisma.mistake.findUnique({
    where: { id: mistakeId },
    select: { studentId: true },
  });

  if (!mistake) throw new ApiError("NOT_FOUND", "Mistake not found");

  if (actor.role === "PARENT") {
    throw new ApiError("FORBIDDEN", "Parents cannot delete mistakes");
  }

  await assertCanAccessStudent(actor, mistake.studentId);

  await prisma.mistake.delete({ where: { id: mistakeId } });
  return { id: mistakeId, deleted: true };
}
