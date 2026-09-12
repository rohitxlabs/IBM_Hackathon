import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";

/**
 * Central authorization rules. Every read or write that touches another
 * person's data goes through this module — route handlers never decide access
 * on their own, and a role claimed by the frontend is never trusted.
 *
 *   STUDENT  → only their own records
 *   PARENT   → only students linked through student_parents
 *   TEACHER  → only students enrolled in a class they own
 */

export async function canAccessStudent(
  actor: Actor,
  studentId: string,
): Promise<boolean> {
  if (actor.role === "STUDENT") {
    return actor.studentId === studentId;
  }

  if (actor.role === "PARENT") {
    if (!actor.parentId) return false;
    const link = await prisma.studentParent.findUnique({
      where: {
        studentId_parentId: { studentId, parentId: actor.parentId },
      },
      select: { id: true },
    });
    return link !== null;
  }

  if (actor.role === "TEACHER") {
    if (!actor.teacherId) return false;
    const enrolment = await prisma.classStudent.findFirst({
      where: { studentId, class: { teacherId: actor.teacherId } },
      select: { id: true },
    });
    return enrolment !== null;
  }

  return false;
}

export async function assertCanAccessStudent(
  actor: Actor,
  studentId: string,
): Promise<void> {
  if (!(await canAccessStudent(actor, studentId))) {
    throw new ApiError(
      "FORBIDDEN",
      "You are not allowed to access this student's data",
    );
  }
}

/** Student ids the actor is allowed to see, used for list endpoints. */
export async function accessibleStudentIds(actor: Actor): Promise<string[]> {
  if (actor.role === "STUDENT") {
    return actor.studentId ? [actor.studentId] : [];
  }

  if (actor.role === "PARENT") {
    if (!actor.parentId) return [];
    const links = await prisma.studentParent.findMany({
      where: { parentId: actor.parentId },
      select: { studentId: true },
    });
    return links.map((l) => l.studentId);
  }

  if (actor.role === "TEACHER") {
    if (!actor.teacherId) return [];
    const enrolments = await prisma.classStudent.findMany({
      where: { class: { teacherId: actor.teacherId } },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    return enrolments.map((e) => e.studentId);
  }

  return [];
}

/** Read access to a class: owning teacher, enrolled student, linked parent. */
export async function canViewClass(
  actor: Actor,
  classId: string,
): Promise<boolean> {
  if (actor.role === "TEACHER" && actor.teacherId) {
    const owned = await prisma.class.findFirst({
      where: { id: classId, teacherId: actor.teacherId },
      select: { id: true },
    });
    if (owned) return true;
  }

  if (actor.role === "STUDENT" && actor.studentId) {
    const enrolled = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId: actor.studentId },
      },
      select: { id: true },
    });
    return enrolled !== null;
  }

  if (actor.role === "PARENT" && actor.parentId) {
    const childEnrolled = await prisma.classStudent.findFirst({
      where: {
        classId,
        student: { parents: { some: { parentId: actor.parentId } } },
      },
      select: { id: true },
    });
    return childEnrolled !== null;
  }

  return false;
}

export async function assertCanViewClass(
  actor: Actor,
  classId: string,
): Promise<void> {
  if (!(await canViewClass(actor, classId))) {
    throw new ApiError("FORBIDDEN", "You are not allowed to view this class");
  }
}

/** Write access to a class is limited to the teacher who owns it. */
export async function assertCanManageClass(
  actor: Actor,
  classId: string,
): Promise<void> {
  if (actor.role !== "TEACHER" || !actor.teacherId) {
    throw new ApiError("FORBIDDEN", "Only teachers can manage classes");
  }

  const owned = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!owned) {
    throw new ApiError("NOT_FOUND", "Class not found");
  }

  if (owned.teacherId !== actor.teacherId) {
    throw new ApiError("FORBIDDEN", "You do not own this class");
  }
}

/** Class ids the actor may read. */
export async function accessibleClassIds(actor: Actor): Promise<string[]> {
  if (actor.role === "TEACHER" && actor.teacherId) {
    const classes = await prisma.class.findMany({
      where: { teacherId: actor.teacherId },
      select: { id: true },
    });
    return classes.map((c) => c.id);
  }

  if (actor.role === "STUDENT" && actor.studentId) {
    const enrolments = await prisma.classStudent.findMany({
      where: { studentId: actor.studentId },
      select: { classId: true },
    });
    return enrolments.map((e) => e.classId);
  }

  if (actor.role === "PARENT" && actor.parentId) {
    const enrolments = await prisma.classStudent.findMany({
      where: { student: { parents: { some: { parentId: actor.parentId } } } },
      select: { classId: true },
      distinct: ["classId"],
    });
    return enrolments.map((e) => e.classId);
  }

  return [];
}

/* ------------------------------- subjects -------------------------------- */

/**
 * Write access to a subject belongs to the teacher who owns it, or to the
 * teacher who owns the class it is attached to.
 */
export async function assertCanManageSubject(
  actor: Actor,
  subjectId: string,
): Promise<void> {
  if (actor.role !== "TEACHER" || !actor.teacherId) {
    throw new ApiError("FORBIDDEN", "Only teachers can manage subjects");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { teacherId: true, class: { select: { teacherId: true } } },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");

  const owns =
    subject.teacherId === actor.teacherId ||
    subject.class?.teacherId === actor.teacherId;

  if (!owns) {
    throw new ApiError("FORBIDDEN", "You do not own this subject");
  }
}

/** Read access follows the class the subject is attached to. */
export async function assertCanViewSubject(
  actor: Actor,
  subjectId: string,
): Promise<void> {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { classId: true, teacherId: true },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");

  if (actor.role === "TEACHER" && subject.teacherId === actor.teacherId) return;

  if (subject.classId && (await canViewClass(actor, subject.classId))) return;

  throw new ApiError("FORBIDDEN", "You are not allowed to view this subject");
}

/** Subject ids the actor may read, used for list endpoints. */
export async function accessibleSubjectIds(actor: Actor): Promise<string[]> {
  const classIds = await accessibleClassIds(actor);

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { classId: { in: classIds } },
        ...(actor.role === "TEACHER" && actor.teacherId
          ? [{ teacherId: actor.teacherId }]
          : []),
      ],
    },
    select: { id: true },
  });

  return subjects.map((s) => s.id);
}
