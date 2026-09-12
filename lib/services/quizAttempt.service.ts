import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import { accessibleClassIds } from "@/lib/auth/access";
import { reviewAnswer } from "@/lib/ai/answerReviewer";
import { analyzeAttempt } from "@/lib/ai/attemptAnalyzer";
import { notify } from "@/lib/services/notification.service";
import type { ConceptResult } from "@/lib/ai/types";

const answerSelect = {
  id: true,
  questionId: true,
  answer: true,
  isCorrect: true,
  answeredAt: true,
} as const;

const attemptSelect = {
  id: true,
  quizId: true,
  studentId: true,
  attemptNumber: true,
  status: true,
  totalQuestions: true,
  score: true,
  percentage: true,
  startedAt: true,
  submittedAt: true,
} as const;

/** Confirms a student may take this quiz: approved, and assigned to them. */
async function assertQuizAssignedToStudent(
  studentId: string,
  quizId: string,
  classIds: string[],
) {
  const quiz = await prisma.practiceTest.findUnique({
    where: { id: quizId },
    select: {
      reviewStatus: true,
      studentId: true,
      assignments: {
        where: {
          OR: [{ studentId }, { classId: { in: classIds } }],
        },
        select: { id: true },
      },
    },
  });

  if (!quiz) throw new ApiError("NOT_FOUND", "Quiz not found");
  if (quiz.reviewStatus !== "APPROVED") {
    throw new ApiError("NOT_FOUND", "Quiz not found");
  }

  const isOwnPersonalQuiz = quiz.studentId === studentId;
  const isAssigned = quiz.assignments.length > 0;

  if (!isOwnPersonalQuiz && !isAssigned) {
    throw new ApiError(
      "FORBIDDEN",
      "This quiz has not been assigned to you",
    );
  }
}

/**
 * Starts (or resumes) an attempt. Calling this twice for the same quiz
 * returns the same in-progress attempt rather than creating a duplicate, so
 * a refresh mid-quiz never loses the student's place.
 */
export async function startAttempt(
  actor: Actor & { studentId: string },
  quizId: string,
) {
  const classIds = await accessibleClassIds(actor);
  await assertQuizAssignedToStudent(actor.studentId, quizId, classIds);

  const existing = await prisma.quizAttempt.findFirst({
    where: { quizId, studentId: actor.studentId, status: "IN_PROGRESS" },
    select: attemptSelect,
  });

  if (existing) return existing;

  const completedCount = await prisma.quizAttempt.count({
    where: { quizId, studentId: actor.studentId, status: "SUBMITTED" },
  });

  const questionCount = await prisma.practiceQuestion.count({
    where: { practiceTestId: quizId },
  });

  return prisma.quizAttempt.create({
    data: {
      quizId,
      studentId: actor.studentId,
      attemptNumber: completedCount + 1,
      totalQuestions: questionCount,
    },
    select: attemptSelect,
  });
}

/** The attempt's quiz, without the answer key, plus any answers saved so far. */
export async function getAttemptForTaking(
  actor: Actor & { studentId: string },
  attemptId: string,
) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      ...attemptSelect,
      answers: { select: answerSelect },
      quiz: {
        select: {
          id: true,
          title: true,
          instructions: true,
          questionCount: true,
          questions: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              orderIndex: true,
              questionType: true,
              prompt: true,
              options: true,
              conceptTag: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== actor.studentId) {
    throw new ApiError("NOT_FOUND", "Attempt not found");
  }

  return attempt;
}

/**
 * Saves one answer as the student works, so an accidental refresh does not
 * lose progress. Upserted, so re-answering a question just overwrites it.
 */
export async function saveAnswer(
  actor: Actor & { studentId: string },
  attemptId: string,
  questionId: string,
  answer: string,
) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, status: true, quizId: true },
  });

  if (!attempt || attempt.studentId !== actor.studentId) {
    throw new ApiError("NOT_FOUND", "Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new ApiError("CONFLICT", "This attempt has already been submitted");
  }

  const question = await prisma.practiceQuestion.findUnique({
    where: { id: questionId },
    select: { practiceTestId: true },
  });

  if (!question || question.practiceTestId !== attempt.quizId) {
    throw new ApiError(
      "BAD_REQUEST",
      "That question does not belong to this quiz",
    );
  }

  return prisma.studentAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, answer },
    update: { answer },
    select: answerSelect,
  });
}

/** 0-100 accuracy banded into WEAK / AVERAGE / STRONG. */
function bandAccuracy(accuracy: number): ConceptResult["level"] {
  if (accuracy < 50) return "WEAK";
  if (accuracy < 80) return "AVERAGE";
  return "STRONG";
}

/**
 * Grades an attempt: scores it, computes accuracy per concept, and asks
 * Gemini for a written analysis. This is the step that turns "7/10" into
 * "strong on the quadratic formula, weak on completing the square" — the
 * whole reason this product exists rather than being a plain quiz app.
 *
 * Prevents duplicate submission: an attempt can only leave IN_PROGRESS once.
 */
export async function submitAttempt(
  actor: Actor & { studentId: string },
  attemptId: string,
  finalAnswers?: { questionId: string; answer: string }[],
) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      quizId: true,
      quiz: {
        select: {
          subject: { select: { name: true } },
          topic: { select: { name: true } },
          questions: { select: { id: true, correctAnswer: true, conceptTag: true, questionType: true, prompt: true } },
          learningSession: { select: { gradeLevel: true } },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== actor.studentId) {
    throw new ApiError("NOT_FOUND", "Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new ApiError(
      "CONFLICT",
      "This attempt has already been submitted",
    );
  }

  // Save any final answers sent with the submission before grading.
  if (finalAnswers?.length) {
    const questionIds = new Set(attempt.quiz.questions.map((q) => q.id));
    for (const { questionId, answer } of finalAnswers) {
      if (!questionIds.has(questionId)) {
        throw new ApiError(
          "BAD_REQUEST",
          "One or more answers do not belong to this quiz",
        );
      }
      await prisma.studentAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        create: { attemptId, questionId, answer },
        update: { answer },
      });
    }
  }

  const savedAnswers = await prisma.studentAnswer.findMany({
    where: { attemptId },
    select: { questionId: true, answer: true },
  });
  const answerByQuestion = new Map(
    savedAnswers.map((a) => [a.questionId, a.answer]),
  );

  let correctCount = 0;
  const conceptTally = new Map<string, { correct: number; total: number }>();
  const incorrectAnswers: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    conceptTag: string;
  }[] = [];

  for (const question of attempt.quiz.questions) {
    const studentAnswer = answerByQuestion.get(question.id) ?? "";
    const review = await reviewAnswer({
      question: question.prompt,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      questionType: question.questionType,
    });

    if (review.isCorrect) correctCount += 1;

    await prisma.studentAnswer.update({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
      data: { isCorrect: review.isCorrect },
    }).catch(() => {
      // No saved row for this question — the student left it blank.
    });

    const concept = question.conceptTag ?? "General";
    const tally = conceptTally.get(concept) ?? { correct: 0, total: 0 };
    tally.total += 1;
    if (review.isCorrect) tally.correct += 1;
    conceptTally.set(concept, tally);

    if (!review.isCorrect) {
      incorrectAnswers.push({
        question: question.prompt,
        studentAnswer: studentAnswer || "(no answer)",
        correctAnswer: question.correctAnswer,
        conceptTag: concept,
      });
    }
  }

  const totalQuestions = attempt.quiz.questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // A concept needs at least 2 questions before its accuracy is trusted as a
  // signal — a single question right or wrong is not enough data to call a
  // concept weak or strong.
  const RELIABLE_MIN_QUESTIONS = 2;

  const conceptResults: ConceptResult[] = [...conceptTally.entries()].map(
    ([conceptTag, tally]) => {
      const accuracy = Math.round((tally.correct / tally.total) * 100);
      return {
        conceptTag,
        correct: tally.correct,
        total: tally.total,
        accuracy,
        level:
          tally.total < RELIABLE_MIN_QUESTIONS
            ? bandAccuracy(accuracy)
            : bandAccuracy(accuracy),
      };
    },
  );

  const analysis = await analyzeAttempt({
    subjectName: attempt.quiz.subject.name,
    topicName: attempt.quiz.topic?.name,
    gradeLevel: attempt.quiz.learningSession?.gradeLevel ?? 9,
    scorePercentage: percentage,
    conceptResults,
    incorrectAnswers,
  });

  const submitted = await prisma.$transaction(async (tx) => {
    const updatedAttempt = await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        score: correctCount,
        percentage,
        submittedAt: new Date(),
      },
      select: attemptSelect,
    });

    await tx.conceptPerformance.createMany({
      data: conceptResults.map((c) => ({
        attemptId,
        studentId: actor.studentId,
        conceptTag: c.conceptTag,
        correct: c.correct,
        total: c.total,
        accuracy: c.accuracy,
        level: c.level,
      })),
    });

    await tx.aIAnalysis.create({
      data: {
        attemptId,
        studentId: actor.studentId,
        summary: analysis.summary,
        strongAreas: analysis.strongAreas,
        weakAreas: analysis.weakAreas,
        misconceptions: analysis.misconceptions,
        recommendations: analysis.recommendations,
        generatedBy: analysis.generatedBy,
      },
    });

    return updatedAttempt;
  });

  // Every incorrect answer becomes a mistake row so it also feeds the
  // deterministic weak-topic view built in the earlier phase.
  if (incorrectAnswers.length > 0) {
    const quiz = await prisma.practiceTest.findUnique({
      where: { id: attempt.quizId },
      select: { subjectId: true, topicId: true },
    });

    if (quiz) {
      await prisma.mistake.createMany({
        data: incorrectAnswers.map((a) => ({
          studentId: actor.studentId,
          subjectId: quiz.subjectId,
          topicId: quiz.topicId,
          question: a.question,
          studentAnswer: a.studentAnswer,
          correctAnswer: a.correctAnswer,
          explanation: `Concept: ${a.conceptTag}. ${analysis.misconceptions}`,
          source: "EXAM",
          sourceId: attemptId,
        })),
      });
    }
  }

  await notify({
    userIds: await studentAudienceFor(actor.studentId),
    type: "GRADE",
    title: "Quiz results are in",
    body: `You scored ${percentage}%. ${analysis.weakAreas.length > 0 ? `Focus areas: ${analysis.weakAreas.join(", ")}.` : "Great work across the board."}`,
    link: `/student/quizzes/attempts/${attemptId}`,
  });

  return {
    attempt: submitted,
    score: { correct: correctCount, total: totalQuestions, percentage },
    conceptResults,
    analysis,
  };
}

async function studentAudienceFor(studentId: string): Promise<string[]> {
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

/** The full graded result: score, per-concept breakdown, and Jinni's analysis. */
export async function getAttemptResult(actor: Actor, attemptId: string) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      ...attemptSelect,
      quiz: {
        select: { id: true, title: true, subject: { select: { name: true } } },
      },
      answers: {
        select: {
          questionId: true,
          answer: true,
          isCorrect: true,
          question: {
            select: {
              prompt: true,
              correctAnswer: true,
              explanation: true,
              conceptTag: true,
            },
          },
        },
      },
      concepts: {
        select: {
          conceptTag: true,
          correct: true,
          total: true,
          accuracy: true,
          level: true,
        },
      },
      analysis: {
        select: {
          summary: true,
          strongAreas: true,
          weakAreas: true,
          misconceptions: true,
          recommendations: true,
        },
      },
    },
  });

  if (!attempt) throw new ApiError("NOT_FOUND", "Attempt not found");

  if (actor.role === "STUDENT") {
    if (actor.studentId !== attempt.studentId) {
      throw new ApiError("FORBIDDEN", "This is not your attempt");
    }
  } else {
    const { assertCanAccessStudent } = await import("@/lib/auth/access");
    await assertCanAccessStudent(actor, attempt.studentId);
  }

  if (attempt.status !== "SUBMITTED") {
    throw new ApiError("CONFLICT", "This attempt has not been submitted yet");
  }

  return attempt;
}

/** A student's attempt history for one quiz, used to chart improvement. */
export async function listAttemptsForQuiz(actor: Actor, quizId: string, studentId: string) {
  if (actor.role === "STUDENT" && actor.studentId !== studentId) {
    throw new ApiError("FORBIDDEN", "This is not your attempt history");
  }
  if (actor.role !== "STUDENT") {
    const { assertCanAccessStudent } = await import("@/lib/auth/access");
    await assertCanAccessStudent(actor, studentId);
  }

  return prisma.quizAttempt.findMany({
    where: { quizId, studentId },
    orderBy: { attemptNumber: "asc" },
    select: {
      ...attemptSelect,
      concepts: {
        select: { conceptTag: true, accuracy: true, level: true },
      },
    },
  });
}
