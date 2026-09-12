import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import { isUniqueViolation } from "@/lib/api/prisma-errors";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleClassIds,
  assertCanManageClass,
  assertCanViewClass,
} from "@/lib/auth/access";
import type {
  AddClassStudentInput,
  CreateClassInput,
  UpdateClassInput,
} from "@/lib/validation/class";

const classSummarySelect = {
  id: true,
  name: true,
  section: true,
  academicYear: true,
  gradeLevel: true,
  createdAt: true,
  teacher: {
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  _count: { select: { students: true, subjects: true, assignments: true } },
} as const;

export async function listClasses(actor: Actor) {
  const ids = await accessibleClassIds(actor);

  return prisma.class.findMany({
    where: { id: { in: ids } },
    orderBy: [{ name: "asc" }, { section: "asc" }],
    select: classSummarySelect,
  });
}

export async function getClass(actor: Actor, classId: string) {
  await assertCanViewClass(actor, classId);

  const found = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      ...classSummarySelect,
      updatedAt: true,
      subjects: {
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      },
      students: {
        orderBy: { enrolledAt: "asc" },
        select: {
          enrolledAt: true,
          student: {
            select: {
              id: true,
              rollNumber: true,
              gradeLevel: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!found) throw new ApiError("NOT_FOUND", "Class not found");
  return found;
}

export async function createClass(
  actor: Actor & { teacherId: string },
  input: CreateClassInput,
) {
  const duplicate = await prisma.class.findUnique({
    where: {
      name_section_academicYear: {
        name: input.name,
        section: input.section,
        academicYear: input.academicYear,
      },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ApiError(
      "CONFLICT",
      "A class with this name, section and academic year already exists",
    );
  }

  return prisma.class.create({
    data: { ...input, teacherId: actor.teacherId },
    select: classSummarySelect,
  });
}

export async function updateClass(
  actor: Actor,
  classId: string,
  input: UpdateClassInput,
) {
  await assertCanManageClass(actor, classId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  try {
    return await prisma.class.update({
      where: { id: classId },
      data: input,
      select: classSummarySelect,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(
        "CONFLICT",
        "Another class already uses this name, section and academic year",
      );
    }
    throw error;
  }
}

export async function deleteClass(actor: Actor, classId: string) {
  await assertCanManageClass(actor, classId);

  await prisma.class.delete({ where: { id: classId } });
  return { id: classId, deleted: true };
}

export async function listClassStudents(actor: Actor, classId: string) {
  await assertCanViewClass(actor, classId);

  return prisma.classStudent.findMany({
    where: { classId },
    orderBy: { enrolledAt: "asc" },
    select: {
      id: true,
      enrolledAt: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          gradeLevel: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function addClassStudent(
  actor: Actor,
  classId: string,
  input: AddClassStudentInput,
) {
  await assertCanManageClass(actor, classId);

  const student = input.studentId
    ? await prisma.student.findUnique({
        where: { id: input.studentId },
        select: { id: true },
      })
    : await prisma.student.findUnique({
        where: { rollNumber: input.rollNumber! },
        select: { id: true },
      });

  if (!student) throw new ApiError("NOT_FOUND", "Student not found");

  const existing = await prisma.classStudent.findUnique({
    where: { classId_studentId: { classId, studentId: student.id } },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError("CONFLICT", "Student is already enrolled in this class");
  }

  return prisma.classStudent.create({
    data: { classId, studentId: student.id },
    select: {
      id: true,
      enrolledAt: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function removeClassStudent(
  actor: Actor,
  classId: string,
  studentId: string,
) {
  await assertCanManageClass(actor, classId);

  const enrolment = await prisma.classStudent.findUnique({
    where: { classId_studentId: { classId, studentId } },
    select: { id: true },
  });

  if (!enrolment) {
    throw new ApiError("NOT_FOUND", "Student is not enrolled in this class");
  }

  await prisma.classStudent.delete({ where: { id: enrolment.id } });
  return { classId, studentId, removed: true };
}

