import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import type { z } from "zod";
import type { listNotificationsQuerySchema } from "@/lib/validation/communication";
import type { NotificationType } from "@/lib/generated/prisma/enums";

/**
 * Minimal notification fan-out. Creating notifications must never break the
 * action that triggered them, so every helper here swallows its own errors
 * and logs instead of throwing.
 */

interface NotifyInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function notify(input: NotifyInput): Promise<void> {
  const userIds = [...new Set(input.userIds)].filter(Boolean);
  if (userIds.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
      })),
    });
  } catch (error) {
    console.error("[notifications] delivery failed:", error);
  }
}

/** User ids of a student's own account plus every linked parent. */
export async function studentAudience(studentId: string): Promise<string[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      userId: true,
      parents: { select: { parent: { select: { userId: true } } } },
    },
  });

  if (!student) return [];

  return [student.userId, ...student.parents.map((p) => p.parent.userId)];
}

/** User ids of every student in a class, plus their linked parents. */
export async function classAudience(classId: string): Promise<string[]> {
  const enrolments = await prisma.classStudent.findMany({
    where: { classId },
    select: {
      student: {
        select: {
          userId: true,
          parents: { select: { parent: { select: { userId: true } } } },
        },
      },
    },
  });

  return enrolments.flatMap((e) => [
    e.student.userId,
    ...e.student.parents.map((p) => p.parent.userId),
  ]);
}

export async function listNotifications(
  actor: Actor,
  filters: z.infer<typeof listNotificationsQuerySchema>,
) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: actor.userId,
        ...(filters.unreadOnly ? { readAt: null } : {}),
        ...(filters.type ? { type: filters.type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: actor.userId, readAt: null },
    }),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationRead(
  actor: Actor,
  notificationId: string,
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== actor.userId) {
    // Do not reveal that someone else's notification exists.
    throw new ApiError("NOT_FOUND", "Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
    select: { id: true, readAt: true },
  });
}

export async function markAllNotificationsRead(actor: Actor) {
  const result = await prisma.notification.updateMany({
    where: { userId: actor.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { updated: result.count };
}
