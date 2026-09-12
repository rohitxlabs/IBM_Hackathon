import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { LoginInput, RegisterInput } from "@/lib/validation/auth";
import type { Actor } from "@/lib/auth/actor";

/** Shape returned to the client. Never includes the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError("CONFLICT", "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        avatarUrl: input.avatarUrl,
        passwordHash,
      },
    });

    if (input.role === "STUDENT") {
      const duplicateRoll = await tx.student.findUnique({
        where: { rollNumber: input.rollNumber },
        select: { id: true },
      });
      if (duplicateRoll) {
        throw new ApiError("CONFLICT", "This roll number is already in use");
      }

      const student = await tx.student.create({
        data: {
          userId: created.id,
          rollNumber: input.rollNumber,
          gradeLevel: input.gradeLevel,
          dateOfBirth: input.dateOfBirth,
        },
      });
      return { ...created, profileId: student.id };
    }

    if (input.role === "TEACHER") {
      const duplicateEmployee = await tx.teacher.findUnique({
        where: { employeeId: input.employeeId },
        select: { id: true },
      });
      if (duplicateEmployee) {
        throw new ApiError("CONFLICT", "This employee id is already in use");
      }

      const teacher = await tx.teacher.create({
        data: {
          userId: created.id,
          employeeId: input.employeeId,
          department: input.department,
          bio: input.bio,
        },
      });
      return { ...created, profileId: teacher.id };
    }

    const parent = await tx.parent.create({
      data: {
        userId: created.id,
        phone: input.phone,
        occupation: input.occupation,
      },
    });
    return { ...created, profileId: parent.id };
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    ...(input.role === "STUDENT" && { studentId: user.profileId }),
    ...(input.role === "TEACHER" && { teacherId: user.profileId }),
    ...(input.role === "PARENT" && { parentId: user.profileId }),
  };
}

export async function authenticateUser(
  input: LoginInput,
): Promise<PublicUser & { userId: string }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      passwordHash: true,
      isActive: true,
      student: { select: { id: true } },
      teacher: { select: { id: true } },
      parent: { select: { id: true } },
    },
  });

  // Compare against a dummy hash when the user is unknown so that the response
  // time does not reveal whether the email exists.
  const hash =
    user?.passwordHash ??
    "$2a$12$0000000000000000000000000000000000000000000000000000";

  const passwordMatches = await verifyPassword(input.password, hash);

  if (!user || !passwordMatches) {
    throw new ApiError("UNAUTHORIZED", "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError("FORBIDDEN", "This account has been deactivated");
  }

  return {
    userId: user.id,
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    ...(user.student && { studentId: user.student.id }),
    ...(user.teacher && { teacherId: user.teacher.id }),
    ...(user.parent && { parentId: user.parent.id }),
  };
}

export function actorToPublicUser(actor: Actor): PublicUser {
  return {
    id: actor.userId,
    email: actor.email,
    name: actor.name,
    role: actor.role,
    avatarUrl: actor.avatarUrl,
    ...(actor.studentId && { studentId: actor.studentId }),
    ...(actor.teacherId && { teacherId: actor.teacherId }),
    ...(actor.parentId && { parentId: actor.parentId }),
  };
}
