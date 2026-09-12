import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import { assertCanAccessStudent } from "@/lib/auth/access";
import type { z } from "zod";
import type {
  linkChildSchema,
  updateParentProfileSchema,
  updateStudentProfileSchema,
  updateTeacherProfileSchema,
} from "@/lib/validation/user";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
} as const;

/* ------------------------------- students ------------------------------- */

export async function getStudentProfile(actor: Actor, studentId: string) {
  await assertCanAccessStudent(actor, studentId);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      rollNumber: true,
      gradeLevel: true,
      dateOfBirth: true,
      createdAt: true,
      updatedAt: true,
      user: { select: userSelect },
      classes: {
        select: {
          enrolledAt: true,
          class: {
            select: {
              id: true,
              name: true,
              section: true,
              academicYear: true,
              gradeLevel: true,
            },
          },
        },
      },
      parents: {
        select: {
          relationship: true,
          isPrimary: true,
          parent: {
            select: { id: true, user: { select: userSelect } },
          },
        },
      },
    },
  });

  if (!student) throw new ApiError("NOT_FOUND", "Student not found");
  return student;
}

export async function updateStudentProfile(
  actor: Actor,
  studentId: string,
  input: z.infer<typeof updateStudentProfileSchema>,
) {
  // Only the student themselves may edit their profile.
  if (actor.role !== "STUDENT" || actor.studentId !== studentId) {
    throw new ApiError("FORBIDDEN", "You can only edit your own profile");
  }

  const { name, avatarUrl, ...profile } = input;

  return prisma.student.update({
    where: { id: studentId },
    data: {
      ...profile,
      ...((name !== undefined || avatarUrl !== undefined) && {
        user: { update: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) } },
      }),
    },
    select: {
      id: true,
      rollNumber: true,
      gradeLevel: true,
      dateOfBirth: true,
      user: { select: userSelect },
    },
  });
}

/* ------------------------------- teachers ------------------------------- */

export async function getTeacherProfile(actor: Actor, teacherId: string) {
  const isSelf = actor.role === "TEACHER" && actor.teacherId === teacherId;

  if (!isSelf) {
    // Students and parents may read the basic profile of a teacher connected
    // to them through a class; everyone else is refused.
    const related = await prisma.class.findFirst({
      where: {
        teacherId,
        students: {
          some:
            actor.role === "STUDENT"
              ? { studentId: actor.studentId ?? "" }
              : {
                  student: {
                    parents: { some: { parentId: actor.parentId ?? "" } },
                  },
                },
        },
      },
      select: { id: true },
    });

    if (!related) {
      throw new ApiError(
        "FORBIDDEN",
        "You are not allowed to view this teacher",
      );
    }
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      employeeId: isSelf,
      department: true,
      bio: true,
      createdAt: true,
      user: { select: userSelect },
      classes: {
        select: { id: true, name: true, section: true, academicYear: true },
      },
    },
  });

  if (!teacher) throw new ApiError("NOT_FOUND", "Teacher not found");
  return teacher;
}

export async function updateTeacherProfile(
  actor: Actor,
  teacherId: string,
  input: z.infer<typeof updateTeacherProfileSchema>,
) {
  if (actor.role !== "TEACHER" || actor.teacherId !== teacherId) {
    throw new ApiError("FORBIDDEN", "You can only edit your own profile");
  }

  const { name, avatarUrl, ...profile } = input;

  return prisma.teacher.update({
    where: { id: teacherId },
    data: {
      ...profile,
      ...((name !== undefined || avatarUrl !== undefined) && {
        user: { update: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) } },
      }),
    },
    select: {
      id: true,
      employeeId: true,
      department: true,
      bio: true,
      user: { select: userSelect },
    },
  });
}

/* -------------------------------- parents ------------------------------- */

export async function getParentProfile(actor: Actor, parentId: string) {
  const isSelf = actor.role === "PARENT" && actor.parentId === parentId;

  if (!isSelf) {
    // A teacher may see a parent of one of their own students.
    const related =
      actor.role === "TEACHER" && actor.teacherId
        ? await prisma.studentParent.findFirst({
            where: {
              parentId,
              student: { classes: { some: { class: { teacherId: actor.teacherId } } } },
            },
            select: { id: true },
          })
        : null;

    if (!related) {
      throw new ApiError("FORBIDDEN", "You are not allowed to view this parent");
    }
  }

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    select: {
      id: true,
      phone: true,
      occupation: true,
      createdAt: true,
      user: { select: userSelect },
      children: {
        select: {
          relationship: true,
          isPrimary: true,
          student: {
            select: {
              id: true,
              rollNumber: true,
              gradeLevel: true,
              user: { select: userSelect },
            },
          },
        },
      },
    },
  });

  if (!parent) throw new ApiError("NOT_FOUND", "Parent not found");
  return parent;
}

export async function updateParentProfile(
  actor: Actor,
  parentId: string,
  input: z.infer<typeof updateParentProfileSchema>,
) {
  if (actor.role !== "PARENT" || actor.parentId !== parentId) {
    throw new ApiError("FORBIDDEN", "You can only edit your own profile");
  }

  const { name, avatarUrl, ...profile } = input;

  return prisma.parent.update({
    where: { id: parentId },
    data: {
      ...profile,
      ...((name !== undefined || avatarUrl !== undefined) && {
        user: { update: { ...(name !== undefined && { name }), ...(avatarUrl !== undefined && { avatarUrl }) } },
      }),
    },
    select: {
      id: true,
      phone: true,
      occupation: true,
      user: { select: userSelect },
    },
  });
}

/* --------------------------- parent ↔ child ----------------------------- */

export async function listChildren(actor: Actor & { parentId: string }) {
  return prisma.studentParent.findMany({
    where: { parentId: actor.parentId },
    orderBy: { createdAt: "asc" },
    select: {
      relationship: true,
      isPrimary: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          gradeLevel: true,
          user: { select: userSelect },
          classes: {
            select: {
              class: {
                select: { id: true, name: true, section: true, academicYear: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function linkChild(
  actor: Actor & { parentId: string },
  input: z.infer<typeof linkChildSchema>,
) {
  const student = await prisma.student.findUnique({
    where: { rollNumber: input.rollNumber },
    select: { id: true, user: { select: { email: true } } },
  });

  // Both identifiers must match, and the failure message stays generic so the
  // endpoint cannot be used to probe which roll numbers exist.
  if (!student || student.user.email !== input.studentEmail) {
    throw new ApiError(
      "NOT_FOUND",
      "No student matches that roll number and email",
    );
  }

  const existing = await prisma.studentParent.findUnique({
    where: {
      studentId_parentId: { studentId: student.id, parentId: actor.parentId },
    },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError("CONFLICT", "This child is already linked");
  }

  return prisma.studentParent.create({
    data: {
      studentId: student.id,
      parentId: actor.parentId,
      relationship: input.relationship,
      isPrimary: input.isPrimary,
    },
    select: {
      id: true,
      relationship: true,
      isPrimary: true,
      student: {
        select: { id: true, rollNumber: true, user: { select: userSelect } },
      },
    },
  });
}

export async function unlinkChild(
  actor: Actor & { parentId: string },
  studentId: string,
) {
  const link = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId: actor.parentId } },
    select: { id: true },
  });

  if (!link) throw new ApiError("NOT_FOUND", "This child is not linked to you");

  await prisma.studentParent.delete({ where: { id: link.id } });
  return { studentId, unlinked: true };
}
