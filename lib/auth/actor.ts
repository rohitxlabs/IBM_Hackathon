import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { readSession } from "@/lib/auth/session";
import type { Role } from "@/lib/generated/prisma/enums";

/**
 * The authenticated caller, resolved fresh from the database on every request
 * so that a revoked account or changed role takes effect immediately.
 */
export interface Actor {
  userId: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  studentId: string | null;
  teacherId: string | null;
  parentId: string | null;
}

export async function getActor(): Promise<Actor | null> {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      student: { select: { id: true } },
      teacher: { select: { id: true } },
      parent: { select: { id: true } },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    studentId: user.student?.id ?? null,
    teacherId: user.teacher?.id ?? null,
    parentId: user.parent?.id ?? null,
  };
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) {
    throw new ApiError("UNAUTHORIZED", "Authentication required");
  }
  return actor;
}

export async function requireRole(...roles: Role[]): Promise<Actor> {
  const actor = await requireActor();
  if (!roles.includes(actor.role)) {
    throw new ApiError(
      "FORBIDDEN",
      `This action requires one of the following roles: ${roles.join(", ")}`,
    );
  }
  return actor;
}

/** Narrowed helpers that also guarantee the matching profile row exists. */
export async function requireStudent(): Promise<Actor & { studentId: string }> {
  const actor = await requireRole("STUDENT");
  if (!actor.studentId) {
    throw new ApiError("FORBIDDEN", "Student profile is missing");
  }
  return actor as Actor & { studentId: string };
}

export async function requireTeacher(): Promise<Actor & { teacherId: string }> {
  const actor = await requireRole("TEACHER");
  if (!actor.teacherId) {
    throw new ApiError("FORBIDDEN", "Teacher profile is missing");
  }
  return actor as Actor & { teacherId: string };
}

export async function requireParent(): Promise<Actor & { parentId: string }> {
  const actor = await requireRole("PARENT");
  if (!actor.parentId) {
    throw new ApiError("FORBIDDEN", "Parent profile is missing");
  }
  return actor as Actor & { parentId: string };
}
