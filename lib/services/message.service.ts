import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import { accessibleStudentIds, assertCanAccessStudent } from "@/lib/auth/access";
import { notify } from "@/lib/services/notification.service";
import type {
  listMessagesQuerySchema,
  sendMessageSchema,
} from "@/lib/validation/communication";

/**
 * Parent ↔ teacher messaging, always about one specific student.
 *
 * Both sides must independently be entitled to that student: a parent through
 * a student_parents link, a teacher through owning a class the student is in.
 * That single rule is what keeps conversations inside the right relationships.
 */

const messageSelect = {
  id: true,
  senderUserId: true,
  recipientUserId: true,
  studentId: true,
  body: true,
  readAt: true,
  createdAt: true,
  sender: { select: { id: true, name: true, role: true } },
  recipient: { select: { id: true, name: true, role: true } },
  student: {
    select: {
      id: true,
      rollNumber: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

/** Confirms a user may discuss a student, and returns their role. */
async function assertPartyMayDiscussStudent(
  userId: string,
  studentId: string,
): Promise<"TEACHER" | "PARENT"> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isActive: true,
      teacher: { select: { id: true } },
      parent: { select: { id: true } },
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError("NOT_FOUND", "Recipient not found");
  }

  if (user.role === "TEACHER" && user.teacher) {
    const teaches = await prisma.classStudent.findFirst({
      where: { studentId, class: { teacherId: user.teacher.id } },
      select: { id: true },
    });

    if (!teaches) {
      throw new ApiError(
        "FORBIDDEN",
        "That teacher does not teach this student",
      );
    }

    return "TEACHER";
  }

  if (user.role === "PARENT" && user.parent) {
    const linked = await prisma.studentParent.findUnique({
      where: {
        studentId_parentId: { studentId, parentId: user.parent.id },
      },
      select: { id: true },
    });

    if (!linked) {
      throw new ApiError("FORBIDDEN", "That parent is not linked to this student");
    }

    return "PARENT";
  }

  throw new ApiError(
    "FORBIDDEN",
    "Messaging is available between parents and teachers only",
  );
}

export async function sendMessage(
  actor: Actor,
  input: z.infer<typeof sendMessageSchema>,
) {
  if (actor.role === "STUDENT") {
    throw new ApiError(
      "FORBIDDEN",
      "Messaging is available between parents and teachers only",
    );
  }

  if (input.recipientUserId === actor.userId) {
    throw new ApiError("BAD_REQUEST", "You cannot message yourself");
  }

  // The sender must be entitled to the student in their own right.
  await assertCanAccessStudent(actor, input.studentId);

  const senderRole = await assertPartyMayDiscussStudent(
    actor.userId,
    input.studentId,
  );
  const recipientRole = await assertPartyMayDiscussStudent(
    input.recipientUserId,
    input.studentId,
  );

  if (senderRole === recipientRole) {
    throw new ApiError(
      "FORBIDDEN",
      "Messages run between a parent and a teacher",
    );
  }

  const message = await prisma.message.create({
    data: {
      senderUserId: actor.userId,
      recipientUserId: input.recipientUserId,
      studentId: input.studentId,
      body: input.body,
    },
    select: messageSelect,
  });

  await notify({
    userIds: [input.recipientUserId],
    type: "MESSAGE",
    title: `New message from ${actor.name}`,
    body: input.body.slice(0, 160),
    link: `/messages?studentId=${input.studentId}`,
  });

  return message;
}

export async function listMessages(
  actor: Actor,
  filters: z.infer<typeof listMessagesQuerySchema>,
) {
  if (actor.role === "STUDENT") {
    throw new ApiError(
      "FORBIDDEN",
      "Messaging is available between parents and teachers only",
    );
  }

  if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
  }

  const studentIds = filters.studentId
    ? [filters.studentId]
    : await accessibleStudentIds(actor);

  const messages = await prisma.message.findMany({
    where: {
      studentId: { in: studentIds },
      OR: [
        { senderUserId: actor.userId },
        { recipientUserId: actor.userId },
      ],
      ...(filters.withUserId
        ? {
            AND: [
              {
                OR: [
                  { senderUserId: filters.withUserId },
                  { recipientUserId: filters.withUserId },
                ],
              },
            ],
          }
        : {}),
      ...(filters.unreadOnly
        ? { readAt: null, recipientUserId: actor.userId }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit,
    select: messageSelect,
  });

  const unreadCount = await prisma.message.count({
    where: { recipientUserId: actor.userId, readAt: null },
  });

  return { messages, unreadCount };
}

export async function markMessageRead(actor: Actor, messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { recipientUserId: true },
  });

  if (!message || message.recipientUserId !== actor.userId) {
    throw new ApiError("NOT_FOUND", "Message not found");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { readAt: new Date() },
    select: { id: true, readAt: true },
  });
}

/**
 * The people this user may start a conversation with, per student — parents
 * see their children's teachers, teachers see their students' parents.
 */
export async function listContacts(actor: Actor) {
  if (actor.role === "PARENT" && actor.parentId) {
    const links = await prisma.studentParent.findMany({
      where: { parentId: actor.parentId },
      select: {
        student: {
          select: {
            id: true,
            user: { select: { name: true } },
            classes: {
              select: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    section: true,
                    teacher: {
                      select: {
                        id: true,
                        user: { select: { id: true, name: true, email: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return links.map((link) => ({
      student: { id: link.student.id, name: link.student.user.name },
      contacts: link.student.classes.map((c) => ({
        userId: c.class.teacher.user.id,
        name: c.class.teacher.user.name,
        role: "TEACHER" as const,
        context: `${c.class.name} ${c.class.section}`,
      })),
    }));
  }

  if (actor.role === "TEACHER" && actor.teacherId) {
    const enrolments = await prisma.classStudent.findMany({
      where: { class: { teacherId: actor.teacherId } },
      select: {
        student: {
          select: {
            id: true,
            user: { select: { name: true } },
            parents: {
              select: {
                relationship: true,
                parent: {
                  select: {
                    id: true,
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrolments.map((e) => ({
      student: { id: e.student.id, name: e.student.user.name },
      contacts: e.student.parents.map((p) => ({
        userId: p.parent.user.id,
        name: p.parent.user.name,
        role: "PARENT" as const,
        context: p.relationship,
      })),
    }));
  }

  throw new ApiError(
    "FORBIDDEN",
    "Messaging is available between parents and teachers only",
  );
}
