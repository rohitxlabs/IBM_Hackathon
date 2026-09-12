import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleClassIds,
  assertCanAccessStudent,
  assertCanManageClass,
  assertCanViewClass,
} from "@/lib/auth/access";
import {
  classAudience,
  notify,
  studentAudience,
} from "@/lib/services/notification.service";
import type {
  createAssignmentSchema,
  gradeSubmissionSchema,
  listAssignmentsQuerySchema,
  submitAssignmentSchema,
  updateAssignmentSchema,
} from "@/lib/validation/academic";

const assignmentSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  maxScore: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  classId: true,
  subjectId: true,
  topicId: true,
  teacherId: true,
  class: { select: { id: true, name: true, section: true } },
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
  teacher: { select: { id: true, user: { select: { id: true, name: true } } } },
} as const;

const submissionSelect = {
  id: true,
  assignmentId: true,
  studentId: true,
  content: true,
  fileUrl: true,
  status: true,
  submittedAt: true,
  score: true,
  feedback: true,
  gradedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Loads an assignment and enforces teacher ownership before any write. */
async function requireOwnedAssignment(actor: Actor, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, teacherId: true, classId: true, maxScore: true },
  });

  if (!assignment) throw new ApiError("NOT_FOUND", "Assignment not found");

  if (actor.role !== "TEACHER" || actor.teacherId !== assignment.teacherId) {
    throw new ApiError("FORBIDDEN", "You do not own this assignment");
  }

  return assignment;
}

/* ----------------------------- teacher side ----------------------------- */

export async function createAssignment(
  actor: Actor & { teacherId: string },
  input: z.infer<typeof createAssignmentSchema>,
) {
  await assertCanManageClass(actor, input.classId);

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: { id: true, classId: true, teacherId: true },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");

  if (
    subject.classId !== null &&
    subject.classId !== input.classId &&
    subject.teacherId !== actor.teacherId
  ) {
    throw new ApiError(
      "FORBIDDEN",
      "That subject does not belong to this class",
    );
  }

  if (input.topicId) {
    await assertTopicBelongsToSubject(input.topicId, input.subjectId);
  }

  const assignment = await prisma.assignment.create({
    data: { ...input, teacherId: actor.teacherId },
    select: assignmentSelect,
  });

  if (assignment.isPublished) {
    await notify({
      userIds: await classAudience(assignment.classId),
      type: "ASSIGNMENT",
      title: `New assignment: ${assignment.title}`,
      body: `${assignment.subject.name} — due ${assignment.dueDate.toDateString()}`,
      link: `/assignments/${assignment.id}`,
    });
  }

  return assignment;
}

export async function updateAssignment(
  actor: Actor,
  assignmentId: string,
  input: z.infer<typeof updateAssignmentSchema>,
) {
  const assignment = await requireOwnedAssignment(actor, assignmentId);

  if (Object.keys(input).length === 0) {
    throw new ApiError("BAD_REQUEST", "No fields to update");
  }

  if (input.topicId) {
    const current = await prisma.assignment.findUnique({
      where: { id: assignment.id },
      select: { subjectId: true },
    });
    await assertTopicBelongsToSubject(input.topicId, current!.subjectId);
  }

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: input,
    select: assignmentSelect,
  });
}

export async function deleteAssignment(actor: Actor, assignmentId: string) {
  await requireOwnedAssignment(actor, assignmentId);
  await prisma.assignment.delete({ where: { id: assignmentId } });
  return { id: assignmentId, deleted: true };
}

/** Every submission for an assignment, plus the students who owe one. */
export async function listAssignmentSubmissions(
  actor: Actor,
  assignmentId: string,
) {
  const assignment = await requireOwnedAssignment(actor, assignmentId);

  const [submissions, roster] = await Promise.all([
    prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: "asc" },
      select: {
        ...submissionSelect,
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.classStudent.findMany({
      where: { classId: assignment.classId },
      select: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
  ]);

  const submitted = new Set(submissions.map((s) => s.studentId));

  return {
    submissions,
    missing: roster
      .filter((r) => !submitted.has(r.student.id))
      .map((r) => r.student),
    stats: {
      total: roster.length,
      submitted: submissions.length,
      graded: submissions.filter((s) => s.status === "GRADED").length,
    },
  };
}

export async function gradeSubmission(
  actor: Actor,
  submissionId: string,
  input: z.infer<typeof gradeSubmissionSchema>,
) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      assignment: { select: { id: true, teacherId: true, maxScore: true } },
    },
  });

  if (!submission) throw new ApiError("NOT_FOUND", "Submission not found");

  if (
    actor.role !== "TEACHER" ||
    actor.teacherId !== submission.assignment.teacherId
  ) {
    throw new ApiError("FORBIDDEN", "You do not own this assignment");
  }

  if (input.score > submission.assignment.maxScore) {
    throw new ApiError(
      "BAD_REQUEST",
      `Score cannot exceed the maximum of ${submission.assignment.maxScore}`,
    );
  }

  const graded = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score: input.score,
      feedback: input.feedback,
      status: "GRADED",
      gradedAt: new Date(),
      gradedById: actor.userId,
    },
    select: { ...submissionSelect, assignment: { select: { title: true } } },
  });

  await notify({
    userIds: await studentAudience(graded.studentId),
    type: "GRADE",
    title: `Assignment graded: ${graded.assignment.title}`,
    body: `Score: ${input.score} out of ${submission.assignment.maxScore}`,
    link: `/assignments/${graded.assignmentId}`,
  });

  return graded;
}

/* ----------------------------- shared reads ----------------------------- */

export async function listAssignments(
  actor: Actor,
  filters: z.infer<typeof listAssignmentsQuerySchema>,
) {
  // A teacher sees everything they created; students and parents only see
  // published work for classes they are connected to.
  let classIds = await accessibleClassIds(actor);

  if (filters.classId) {
    await assertCanViewClass(actor, filters.classId);
    classIds = [filters.classId];
  }

  // Which student's submission should be attached to each assignment.
  let studentId: string | null = null;

  if (actor.role === "STUDENT") {
    studentId = actor.studentId;
  } else if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
    studentId = filters.studentId;
  }

  if (studentId && actor.role !== "TEACHER") {
    const enrolments = await prisma.classStudent.findMany({
      where: { studentId, classId: { in: classIds } },
      select: { classId: true },
    });
    classIds = enrolments.map((e) => e.classId);
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      classId: { in: classIds },
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(actor.role === "TEACHER" ? {} : { isPublished: true }),
    },
    orderBy: { dueDate: "asc" },
    select: {
      ...assignmentSelect,
      ...(studentId
        ? {
            submissions: {
              where: { studentId },
              select: submissionSelect,
            },
          }
        : { _count: { select: { submissions: true } } }),
    },
  });

  const withStatus = assignments.map((assignment) => {
    if (!studentId) return assignment;

    const submissions = (assignment as { submissions?: unknown[] }).submissions;
    const submission = (submissions?.[0] as
      | { status: string; score: number | null }
      | undefined) ?? null;

    return {
      ...assignment,
      submission,
      status: derivedStatus(assignment.dueDate, submission),
    };
  });

  if (!filters.status) return withStatus;

  return withStatus.filter(
    (a) => (a as { status?: string }).status === filters.status,
  );
}

export async function getAssignment(actor: Actor, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: assignmentSelect,
  });

  if (!assignment) throw new ApiError("NOT_FOUND", "Assignment not found");

  const isOwner =
    actor.role === "TEACHER" && actor.teacherId === assignment.teacherId;

  if (!isOwner) {
    await assertCanViewClass(actor, assignment.classId);

    if (!assignment.isPublished) {
      throw new ApiError("NOT_FOUND", "Assignment not found");
    }
  }

  if (actor.role === "STUDENT" && actor.studentId) {
    const submission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId, studentId: actor.studentId },
      },
      select: submissionSelect,
    });

    return {
      ...assignment,
      submission,
      status: derivedStatus(assignment.dueDate, submission),
    };
  }

  return assignment;
}

/* ----------------------------- student side ----------------------------- */

export async function submitAssignment(
  actor: Actor & { studentId: string },
  assignmentId: string,
  input: z.infer<typeof submitAssignmentSchema>,
) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, classId: true, dueDate: true, isPublished: true },
  });

  if (!assignment || !assignment.isPublished) {
    throw new ApiError("NOT_FOUND", "Assignment not found");
  }

  const enrolled = await prisma.classStudent.findUnique({
    where: {
      classId_studentId: {
        classId: assignment.classId,
        studentId: actor.studentId,
      },
    },
    select: { id: true },
  });

  if (!enrolled) {
    throw new ApiError(
      "FORBIDDEN",
      "You are not enrolled in the class for this assignment",
    );
  }

  const existing = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: { assignmentId, studentId: actor.studentId },
    },
    select: { id: true, status: true },
  });

  if (existing?.status === "GRADED") {
    throw new ApiError(
      "CONFLICT",
      "This submission has already been graded and cannot be changed",
    );
  }

  const now = new Date();
  const status = now > assignment.dueDate ? "LATE" : "SUBMITTED";

  return prisma.submission.upsert({
    where: {
      assignmentId_studentId: { assignmentId, studentId: actor.studentId },
    },
    create: {
      assignmentId,
      studentId: actor.studentId,
      content: input.content,
      fileUrl: input.fileUrl,
      status,
      submittedAt: now,
    },
    update: {
      content: input.content,
      fileUrl: input.fileUrl,
      status,
      submittedAt: now,
    },
    select: submissionSelect,
  });
}

/** A student's own submission, or a child's for a parent, or a teacher's view. */
export async function getSubmission(
  actor: Actor,
  assignmentId: string,
  studentId: string,
) {
  await assertCanAccessStudent(actor, studentId);

  const submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: {
      ...submissionSelect,
      assignment: { select: assignmentSelect },
    },
  });

  if (!submission) throw new ApiError("NOT_FOUND", "No submission yet");
  return submission;
}

/* -------------------------------- helpers ------------------------------- */

function derivedStatus(
  dueDate: Date,
  submission: { status: string } | null,
): string {
  if (submission) return submission.status;
  return new Date() > dueDate ? "OVERDUE" : "PENDING";
}

async function assertTopicBelongsToSubject(topicId: string, subjectId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { subjectId: true },
  });

  if (!topic) throw new ApiError("NOT_FOUND", "Topic not found");

  if (topic.subjectId !== subjectId) {
    throw new ApiError("BAD_REQUEST", "That topic belongs to another subject");
  }
}
