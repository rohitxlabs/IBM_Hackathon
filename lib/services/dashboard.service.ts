import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import { assertCanAccessStudent } from "@/lib/auth/access";
import { computeWeakTopics } from "@/lib/services/weakTopic.service";

/**
 * Dashboard aggregates and derived progress.
 *
 * There is no progress table by design: every figure below is computed from
 * submissions, exam results, mistakes and practice tests at read time, so it
 * can never drift out of step with the underlying academic records.
 */

const UPCOMING_WINDOW_DAYS = 30;

function percentage(score: number, max: number): number {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

/* ------------------------------- progress -------------------------------- */

export interface StudentProgress {
  studentId: string;
  assignments: {
    total: number;
    submitted: number;
    graded: number;
    pending: number;
    overdue: number;
    completionRate: number;
    averageScore: number | null;
  };
  exams: {
    taken: number;
    upcoming: number;
    averageScore: number | null;
    best: { title: string; percentage: number } | null;
  };
  practice: {
    completed: number;
    averageScore: number | null;
  };
  mistakes: { total: number; last30Days: number };
  subjects: {
    subjectId: string;
    subjectName: string;
    averageScore: number | null;
    gradedItems: number;
  }[];
}

export async function computeStudentProgress(
  actor: Actor,
  studentId: string,
): Promise<StudentProgress> {
  await assertCanAccessStudent(actor, studentId);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [enrolments, submissions, examResults, upcomingExams, practice, mistakes, recentMistakes] =
    await Promise.all([
      prisma.classStudent.findMany({
        where: { studentId },
        select: { classId: true },
      }),
      prisma.submission.findMany({
        where: { studentId },
        select: {
          status: true,
          score: true,
          assignment: {
            select: {
              maxScore: true,
              subjectId: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.examResult.findMany({
        where: { studentId },
        select: {
          score: true,
          exam: {
            select: {
              title: true,
              maxScore: true,
              subjectId: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.exam.count({
        where: {
          examDate: { gte: now },
          class: { students: { some: { studentId } } },
        },
      }),
      prisma.practiceTest.findMany({
        where: { studentId, status: "COMPLETED" },
        select: { score: true, totalScore: true },
      }),
      prisma.mistake.count({ where: { studentId } }),
      prisma.mistake.count({
        where: { studentId, createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

  const classIds = enrolments.map((e) => e.classId);

  const totalAssignments = await prisma.assignment.count({
    where: { classId: { in: classIds }, isPublished: true },
  });

  const overdue = await prisma.assignment.count({
    where: {
      classId: { in: classIds },
      isPublished: true,
      dueDate: { lt: now },
      submissions: { none: { studentId } },
    },
  });

  const gradedSubmissions = submissions.filter(
    (s) => s.status === "GRADED" && s.score !== null,
  );

  const assignmentScore = gradedSubmissions.reduce(
    (acc, s) => ({
      score: acc.score + (s.score ?? 0),
      max: acc.max + s.assignment.maxScore,
    }),
    { score: 0, max: 0 },
  );

  const examScore = examResults.reduce(
    (acc, r) => ({
      score: acc.score + r.score,
      max: acc.max + r.exam.maxScore,
    }),
    { score: 0, max: 0 },
  );

  const bestExam = examResults
    .map((r) => ({
      title: r.exam.title,
      percentage: percentage(r.score, r.exam.maxScore),
    }))
    .sort((a, b) => b.percentage - a.percentage)[0];

  const practiceScore = practice.reduce(
    (acc, p) => ({
      score: acc.score + (p.score ?? 0),
      max: acc.max + (p.totalScore ?? 0),
    }),
    { score: 0, max: 0 },
  );

  // Per-subject averages blend graded assignments and exam results.
  const bySubject = new Map<
    string,
    { name: string; score: number; max: number; items: number }
  >();

  for (const s of gradedSubmissions) {
    const entry = bySubject.get(s.assignment.subjectId) ?? {
      name: s.assignment.subject.name,
      score: 0,
      max: 0,
      items: 0,
    };
    entry.score += s.score ?? 0;
    entry.max += s.assignment.maxScore;
    entry.items += 1;
    bySubject.set(s.assignment.subjectId, entry);
  }

  for (const r of examResults) {
    const entry = bySubject.get(r.exam.subjectId) ?? {
      name: r.exam.subject.name,
      score: 0,
      max: 0,
      items: 0,
    };
    entry.score += r.score;
    entry.max += r.exam.maxScore;
    entry.items += 1;
    bySubject.set(r.exam.subjectId, entry);
  }

  return {
    studentId,
    assignments: {
      total: totalAssignments,
      submitted: submissions.length,
      graded: gradedSubmissions.length,
      pending: Math.max(0, totalAssignments - submissions.length),
      overdue,
      completionRate: percentage(submissions.length, totalAssignments),
      averageScore:
        assignmentScore.max > 0
          ? percentage(assignmentScore.score, assignmentScore.max)
          : null,
    },
    exams: {
      taken: examResults.length,
      upcoming: upcomingExams,
      averageScore:
        examScore.max > 0 ? percentage(examScore.score, examScore.max) : null,
      best: bestExam ?? null,
    },
    practice: {
      completed: practice.length,
      averageScore:
        practiceScore.max > 0
          ? percentage(practiceScore.score, practiceScore.max)
          : null,
    },
    mistakes: { total: mistakes, last30Days: recentMistakes },
    subjects: [...bySubject.entries()].map(([subjectId, entry]) => ({
      subjectId,
      subjectName: entry.name,
      averageScore: entry.max > 0 ? percentage(entry.score, entry.max) : null,
      gradedItems: entry.items,
    })),
  };
}

/* ------------------------------ dashboards ------------------------------- */

export async function buildDashboard(actor: Actor) {
  if (actor.role === "STUDENT") return studentDashboard(actor);
  if (actor.role === "TEACHER") return teacherDashboard(actor);
  return parentDashboard(actor);
}

async function studentDashboard(actor: Actor) {
  if (!actor.studentId) {
    throw new ApiError("FORBIDDEN", "Student profile is missing");
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 86_400_000);

  const [progress, weak, classes, upcomingAssignments, upcomingExams, recentGrades, unreadNotifications] =
    await Promise.all([
      computeStudentProgress(actor, actor.studentId),
      computeWeakTopics(actor, {
        studentId: actor.studentId,
        limit: 5,
        includeStrong: false,
      }),
      prisma.classStudent.findMany({
        where: { studentId: actor.studentId },
        select: {
          class: {
            select: {
              id: true,
              name: true,
              section: true,
              teacher: { select: { user: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          isPublished: true,
          dueDate: { gte: now, lte: horizon },
          class: { students: { some: { studentId: actor.studentId } } },
          submissions: { none: { studentId: actor.studentId } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          dueDate: true,
          maxScore: true,
          subject: { select: { name: true } },
        },
      }),
      prisma.exam.findMany({
        where: {
          examDate: { gte: now },
          class: { students: { some: { studentId: actor.studentId } } },
        },
        orderBy: { examDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          examDate: true,
          examType: true,
          subject: { select: { name: true } },
        },
      }),
      prisma.submission.findMany({
        where: { studentId: actor.studentId, status: "GRADED" },
        orderBy: { gradedAt: "desc" },
        take: 5,
        select: {
          id: true,
          score: true,
          gradedAt: true,
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.notification.count({
        where: { userId: actor.userId, readAt: null },
      }),
    ]);

  const practiceTests = await prisma.practiceTest.findMany({
    where: { studentId: actor.studentId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      score: true,
      totalScore: true,
      subject: { select: { name: true } },
    },
  });

  return {
    role: "STUDENT" as const,
    progress,
    weakTopics: weak.topics,
    classes: classes.map((c) => c.class),
    upcomingAssignments,
    upcomingExams,
    recentGrades,
    practiceTests,
    unreadNotifications,
  };
}

async function teacherDashboard(actor: Actor) {
  if (!actor.teacherId) {
    throw new ApiError("FORBIDDEN", "Teacher profile is missing");
  }

  const now = new Date();

  const classes = await prisma.class.findMany({
    where: { teacherId: actor.teacherId },
    orderBy: [{ name: "asc" }, { section: "asc" }],
    select: {
      id: true,
      name: true,
      section: true,
      academicYear: true,
      _count: { select: { students: true, assignments: true, exams: true } },
    },
  });

  const classIds = classes.map((c) => c.id);

  const [studentCount, pendingGrading, upcomingExams, recentSubmissions, unreadMessages] =
    await Promise.all([
      prisma.classStudent.count({ where: { classId: { in: classIds } } }),
      prisma.submission.count({
        where: {
          status: { in: ["SUBMITTED", "LATE"] },
          assignment: { teacherId: actor.teacherId },
        },
      }),
      prisma.exam.findMany({
        where: { teacherId: actor.teacherId, examDate: { gte: now } },
        orderBy: { examDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          examDate: true,
          class: { select: { name: true, section: true } },
        },
      }),
      prisma.submission.findMany({
        where: { assignment: { teacherId: actor.teacherId } },
        orderBy: { submittedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          submittedAt: true,
          student: {
            select: { id: true, user: { select: { name: true } } },
          },
          assignment: { select: { id: true, title: true } },
        },
      }),
      prisma.message.count({
        where: { recipientUserId: actor.userId, readAt: null },
      }),
    ]);

  // Class performance, averaged from graded submissions and exam results.
  const [gradedSubmissions, examResults] = await Promise.all([
    prisma.submission.findMany({
      where: {
        status: "GRADED",
        score: { not: null },
        assignment: { classId: { in: classIds } },
      },
      select: {
        score: true,
        assignment: { select: { classId: true, maxScore: true } },
      },
    }),
    prisma.examResult.findMany({
      where: { exam: { classId: { in: classIds } } },
      select: { score: true, exam: { select: { classId: true, maxScore: true } } },
    }),
  ]);

  const perClass = new Map<string, { score: number; max: number }>();

  for (const s of gradedSubmissions) {
    const entry = perClass.get(s.assignment.classId) ?? { score: 0, max: 0 };
    entry.score += s.score ?? 0;
    entry.max += s.assignment.maxScore;
    perClass.set(s.assignment.classId, entry);
  }

  for (const r of examResults) {
    const entry = perClass.get(r.exam.classId) ?? { score: 0, max: 0 };
    entry.score += r.score;
    entry.max += r.exam.maxScore;
    perClass.set(r.exam.classId, entry);
  }

  // Topics the teacher's students collectively struggle with most.
  const weakestTopics = await prisma.mistake.groupBy({
    by: ["topicId"],
    where: {
      topicId: { not: null },
      student: { classes: { some: { classId: { in: classIds } } } },
    },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const topicIds = weakestTopics
    .map((t) => t.topicId)
    .filter((id): id is string => Boolean(id));

  const topics = topicIds.length
    ? await prisma.topic.findMany({
        where: { id: { in: topicIds } },
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } },
        },
      })
    : [];

  const topicById = new Map(topics.map((t) => [t.id, t]));

  return {
    role: "TEACHER" as const,
    totals: {
      classes: classes.length,
      students: studentCount,
      pendingGrading,
    },
    classes: classes.map((c) => {
      const perf = perClass.get(c.id);
      return {
        ...c,
        averageScore:
          perf && perf.max > 0 ? percentage(perf.score, perf.max) : null,
      };
    }),
    upcomingExams,
    recentSubmissions,
    classWeakTopics: weakestTopics.map((t) => ({
      topicId: t.topicId,
      topicName: t.topicId ? (topicById.get(t.topicId)?.name ?? null) : null,
      subjectName: t.topicId
        ? (topicById.get(t.topicId)?.subject.name ?? null)
        : null,
      mistakeCount: t._count._all,
    })),
    unreadMessages,
  };
}

async function parentDashboard(actor: Actor) {
  if (!actor.parentId) {
    throw new ApiError("FORBIDDEN", "Parent profile is missing");
  }

  const links = await prisma.studentParent.findMany({
    where: { parentId: actor.parentId },
    select: {
      relationship: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          gradeLevel: true,
          user: { select: { id: true, name: true } },
          classes: {
            select: {
              class: {
                select: {
                  id: true,
                  name: true,
                  section: true,
                  teacher: {
                    select: {
                      user: { select: { id: true, name: true } },
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

  const now = new Date();

  const children = await Promise.all(
    links.map(async (link) => {
      const studentId = link.student.id;

      const [progress, weak, pendingHomework, upcomingExams, recentGrades] =
        await Promise.all([
          computeStudentProgress(actor, studentId),
          computeWeakTopics(actor, {
            studentId,
            limit: 3,
            includeStrong: false,
          }),
          prisma.assignment.findMany({
            where: {
              isPublished: true,
              dueDate: { gte: now },
              class: { students: { some: { studentId } } },
              submissions: { none: { studentId } },
            },
            orderBy: { dueDate: "asc" },
            take: 5,
            select: {
              id: true,
              title: true,
              dueDate: true,
              subject: { select: { name: true } },
            },
          }),
          prisma.exam.findMany({
            where: {
              examDate: { gte: now },
              class: { students: { some: { studentId } } },
            },
            orderBy: { examDate: "asc" },
            take: 5,
            select: {
              id: true,
              title: true,
              examDate: true,
              subject: { select: { name: true } },
            },
          }),
          prisma.examResult.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              score: true,
              grade: true,
              exam: {
                select: { id: true, title: true, maxScore: true },
              },
            },
          }),
        ]);

      return {
        relationship: link.relationship,
        student: {
          id: studentId,
          name: link.student.user.name,
          rollNumber: link.student.rollNumber,
          gradeLevel: link.student.gradeLevel,
        },
        classes: link.student.classes.map((c) => c.class),
        teachers: link.student.classes.map((c) => ({
          userId: c.class.teacher.user.id,
          name: c.class.teacher.user.name,
          context: `${c.class.name} ${c.class.section}`,
        })),
        progress,
        weakTopics: weak.topics,
        pendingHomework,
        upcomingExams,
        recentGrades,
      };
    }),
  );

  const unreadMessages = await prisma.message.count({
    where: { recipientUserId: actor.userId, readAt: null },
  });

  return { role: "PARENT" as const, children, unreadMessages };
}
