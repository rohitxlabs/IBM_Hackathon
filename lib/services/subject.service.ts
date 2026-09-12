import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { isUniqueViolation } from "@/lib/api/prisma-errors";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleSubjectIds,
  assertCanManageClass,
  assertCanManageSubject,
  assertCanViewSubject,
} from "@/lib/auth/access";
import type {
  createSubjectSchema,
  createTopicSchema,
  updateSubjectSchema,
  updateTopicSchema,
} from "@/lib/validation/academic";

const subjectSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  classId: true,
  teacherId: true,
  createdAt: true,
  updatedAt: true,
  class: { select: { id: true, name: true, section: true } },
  teacher: { select: { id: true, user: { select: { id: true, name: true } } } },
  _count: { select: { topics: true, assignments: true, exams: true } },
} as const;

/* ------------------------------- subjects ------------------------------- */

export async function listSubjects(actor: Actor, filters: { classId?: string }) {
  const ids = await accessibleSubjectIds(actor);

  return prisma.subject.findMany({
    where: {
      id: { in: ids },
      ...(filters.classId ? { classId: filters.classId } : {}),
    },
    orderBy: { name: "asc" },
    select: subjectSelect,
  });
}

export async function getSubject(actor: Actor, subjectId: string) {
  await assertCanViewSubject(actor, subjectId);

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      ...subjectSelect,
      topics: {
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          description: true,
          orderIndex: true,
        },
      },
    },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");
  return subject;
}

export async function createSubject(
  actor: Actor & { teacherId: string },
  input: z.infer<typeof createSubjectSchema>,
) {
  if (input.classId) {
    await assertCanManageClass(actor, input.classId);
  }

  const duplicate = await prisma.subject.findUnique({
    where: { code: input.code },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError("CONFLICT", "A subject with this code already exists");
  }

  return prisma.subject.create({
    data: { ...input, teacherId: actor.teacherId },
    select: subjectSelect,
  });
}

export async function updateSubject(
  actor: Actor,
  subjectId: string,
  input: z.infer<typeof updateSubjectSchema>,
) {
  await assertCanManageSubject(actor, subjectId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  if (input.classId) {
    await assertCanManageClass(actor, input.classId);
  }

  try {
    return await prisma.subject.update({
      where: { id: subjectId },
      data: input,
      select: subjectSelect,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError("CONFLICT", "Another subject already uses this code");
    }
    throw error;
  }
}

export async function deleteSubject(actor: Actor, subjectId: string) {
  await assertCanManageSubject(actor, subjectId);

  const inUse = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { _count: { select: { assignments: true, exams: true } } },
  });

  if (inUse && (inUse._count.assignments > 0 || inUse._count.exams > 0)) {
    throw new ApiError(
      "CONFLICT",
      "This subject still has assignments or exams and cannot be deleted",
    );
  }

  await prisma.subject.delete({ where: { id: subjectId } });
  return { id: subjectId, deleted: true };
}

/* -------------------------------- topics -------------------------------- */

const topicSelect = {
  id: true,
  name: true,
  description: true,
  orderIndex: true,
  subjectId: true,
  createdAt: true,
  updatedAt: true,
  subject: { select: { id: true, name: true, code: true } },
} as const;

export async function listTopics(actor: Actor, filters: { subjectId?: string }) {
  if (filters.subjectId) {
    await assertCanViewSubject(actor, filters.subjectId);
    return prisma.topic.findMany({
      where: { subjectId: filters.subjectId },
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      select: topicSelect,
    });
  }

  const subjectIds = await accessibleSubjectIds(actor);

  return prisma.topic.findMany({
    where: { subjectId: { in: subjectIds } },
    orderBy: [{ subjectId: "asc" }, { orderIndex: "asc" }],
    select: topicSelect,
  });
}

export async function createTopic(
  actor: Actor,
  input: z.infer<typeof createTopicSchema>,
) {
  await assertCanManageSubject(actor, input.subjectId);

  try {
    return await prisma.topic.create({ data: input, select: topicSelect });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(
        "CONFLICT",
        "This subject already has a topic with that name",
      );
    }
    throw error;
  }
}

export async function updateTopic(
  actor: Actor,
  topicId: string,
  input: z.infer<typeof updateTopicSchema>,
) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { subjectId: true },
  });

  if (!topic) throw new ApiError("NOT_FOUND", "Topic not found");
  await assertCanManageSubject(actor, topic.subjectId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  try {
    return await prisma.topic.update({
      where: { id: topicId },
      data: input,
      select: topicSelect,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(
        "CONFLICT",
        "This subject already has a topic with that name",
      );
    }
    throw error;
  }
}

export async function deleteTopic(actor: Actor, topicId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { subjectId: true },
  });

  if (!topic) throw new ApiError("NOT_FOUND", "Topic not found");
  await assertCanManageSubject(actor, topic.subjectId);

  await prisma.topic.delete({ where: { id: topicId } });
  return { id: topicId, deleted: true };
}

