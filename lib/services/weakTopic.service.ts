import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Actor } from "@/lib/auth/actor";
import { assertCanAccessStudent } from "@/lib/auth/access";
import type { weakTopicsQuerySchema } from "@/lib/validation/learning";
import { ApiError } from "@/lib/api/response";

/**
 * Deterministic weak-topic detection — no machine learning, no AI call.
 *
 * Three signals per topic, all already in the database:
 *   1. how often the student got that topic wrong (mistakes)
 *   2. practice accuracy on that topic (practice questions answered)
 *   3. graded academic performance on that topic (assignments and exams)
 *
 * They are blended into a 0-100 weakness score. A topic counts as weak when
 * the score clears the threshold, which keeps the result explainable: every
 * number returned can be traced back to rows the student can see.
 */

const WEAK_THRESHOLD = 40;
const HIGH_THRESHOLD = 70;
const MEDIUM_THRESHOLD = 55;

export interface TopicSignals {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  mistakeCount: number;
  practiceAttempts: number;
  practiceCorrect: number;
  practiceAccuracy: number | null;
  academicAttempts: number;
  academicAccuracy: number | null;
  weaknessScore: number;
  level: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  isWeak: boolean;
  reasons: string[];
}

export async function computeWeakTopics(
  actor: Actor,
  filters: z.infer<typeof weakTopicsQuerySchema>,
): Promise<{ studentId: string; topics: TopicSignals[] }> {
  const studentId =
    filters.studentId ?? (actor.role === "STUDENT" ? actor.studentId : null);

  if (!studentId) {
    throw new ApiError("BAD_REQUEST", "studentId is required");
  }

  await assertCanAccessStudent(actor, studentId);

  const subjectFilter = filters.subjectId
    ? { subjectId: filters.subjectId }
    : {};

  const [mistakes, practice, submissions, examResults] = await Promise.all([
    prisma.mistake.groupBy({
      by: ["topicId"],
      where: { studentId, topicId: { not: null }, ...subjectFilter },
      _count: { _all: true },
    }),
    prisma.practiceQuestion.findMany({
      where: {
        topicId: { not: null },
        studentAnswer: { not: null },
        practiceTest: { studentId, ...subjectFilter },
      },
      select: { topicId: true, isCorrect: true },
    }),
    prisma.submission.findMany({
      where: {
        studentId,
        status: "GRADED",
        score: { not: null },
        assignment: { topicId: { not: null }, ...subjectFilter },
      },
      select: {
        score: true,
        assignment: { select: { topicId: true, maxScore: true } },
      },
    }),
    prisma.examResult.findMany({
      where: {
        studentId,
        exam: { topicId: { not: null }, ...subjectFilter },
      },
      select: {
        score: true,
        exam: { select: { topicId: true, maxScore: true } },
      },
    }),
  ]);

  const stats = new Map<
    string,
    {
      mistakes: number;
      practiceAttempts: number;
      practiceCorrect: number;
      academicScore: number;
      academicMax: number;
      academicAttempts: number;
    }
  >();

  const bucket = (topicId: string) => {
    let entry = stats.get(topicId);
    if (!entry) {
      entry = {
        mistakes: 0,
        practiceAttempts: 0,
        practiceCorrect: 0,
        academicScore: 0,
        academicMax: 0,
        academicAttempts: 0,
      };
      stats.set(topicId, entry);
    }
    return entry;
  };

  for (const row of mistakes) {
    if (row.topicId) bucket(row.topicId).mistakes += row._count._all;
  }

  for (const question of practice) {
    if (!question.topicId) continue;
    const entry = bucket(question.topicId);
    entry.practiceAttempts += 1;
    if (question.isCorrect) entry.practiceCorrect += 1;
  }

  for (const submission of submissions) {
    const topicId = submission.assignment.topicId;
    if (!topicId || submission.score === null) continue;
    const entry = bucket(topicId);
    entry.academicScore += submission.score;
    entry.academicMax += submission.assignment.maxScore;
    entry.academicAttempts += 1;
  }

  for (const result of examResults) {
    const topicId = result.exam.topicId;
    if (!topicId) continue;
    const entry = bucket(topicId);
    entry.academicScore += result.score;
    entry.academicMax += result.exam.maxScore;
    entry.academicAttempts += 1;
  }

  if (stats.size === 0) {
    return { studentId, topics: [] };
  }

  const topics = await prisma.topic.findMany({
    where: { id: { in: [...stats.keys()] } },
    select: {
      id: true,
      name: true,
      subject: { select: { id: true, name: true } },
    },
  });

  const scored = topics.map((topic) => {
    const entry = stats.get(topic.id)!;

    const practiceAccuracy =
      entry.practiceAttempts > 0
        ? entry.practiceCorrect / entry.practiceAttempts
        : null;

    const academicAccuracy =
      entry.academicMax > 0 ? entry.academicScore / entry.academicMax : null;

    return {
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subject.id,
      subjectName: topic.subject.name,
      mistakeCount: entry.mistakes,
      practiceAttempts: entry.practiceAttempts,
      practiceCorrect: entry.practiceCorrect,
      practiceAccuracy: round(practiceAccuracy),
      academicAttempts: entry.academicAttempts,
      academicAccuracy: round(academicAccuracy),
      ...score({
        mistakes: entry.mistakes,
        practiceAccuracy,
        practiceAttempts: entry.practiceAttempts,
        academicAccuracy,
        academicAttempts: entry.academicAttempts,
      }),
    };
  });

  const ordered = scored.sort((a, b) => b.weaknessScore - a.weaknessScore);

  return {
    studentId,
    topics: (filters.includeStrong
      ? ordered
      : ordered.filter((t) => t.isWeak)
    ).slice(0, filters.limit),
  };
}

/** Blends the three signals into a score, and explains what drove it. */
function score(input: {
  mistakes: number;
  practiceAccuracy: number | null;
  practiceAttempts: number;
  academicAccuracy: number | null;
  academicAttempts: number;
}): Pick<TopicSignals, "weaknessScore" | "level" | "isWeak" | "reasons"> {
  const reasons: string[] = [];
  const weighted: { accuracy: number; weight: number }[] = [];

  if (input.practiceAccuracy !== null) {
    // More attempts means the accuracy figure carries more information.
    const weight = input.practiceAttempts >= 3 ? 2 : 1;
    weighted.push({ accuracy: input.practiceAccuracy, weight });

    if (input.practiceAccuracy < 0.6) {
      reasons.push(
        `Practice accuracy is ${Math.round(input.practiceAccuracy * 100)}% over ${input.practiceAttempts} question(s)`,
      );
    }
  }

  if (input.academicAccuracy !== null) {
    weighted.push({ accuracy: input.academicAccuracy, weight: 2 });

    if (input.academicAccuracy < 0.6) {
      reasons.push(
        `Graded work averages ${Math.round(input.academicAccuracy * 100)}% on this topic`,
      );
    }
  }

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);

  const blendedAccuracy =
    totalWeight > 0
      ? weighted.reduce((sum, w) => sum + w.accuracy * w.weight, 0) / totalWeight
      : null;

  // Each recorded mistake adds a fixed, capped penalty.
  const mistakePenalty = Math.min(30, input.mistakes * 8);

  if (input.mistakes >= 2) {
    reasons.push(`${input.mistakes} recorded mistakes on this topic`);
  } else if (input.mistakes === 1) {
    reasons.push("1 recorded mistake on this topic");
  }

  const base =
    blendedAccuracy !== null
      ? (1 - blendedAccuracy) * 100
      : Math.min(60, input.mistakes * 20);

  const weaknessScore = Math.max(0, Math.min(100, Math.round(base + mistakePenalty)));

  const level =
    weaknessScore >= HIGH_THRESHOLD
      ? "HIGH"
      : weaknessScore >= MEDIUM_THRESHOLD
        ? "MEDIUM"
        : weaknessScore >= WEAK_THRESHOLD
          ? "LOW"
          : "NONE";

  return {
    weaknessScore,
    level,
    isWeak: weaknessScore >= WEAK_THRESHOLD,
    reasons,
  };
}

function round(value: number | null): number | null {
  return value === null ? null : Math.round(value * 100) / 100;
}
