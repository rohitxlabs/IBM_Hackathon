import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/actor";
import {
  accessibleStudentIds,
  assertCanAccessStudent,
  assertCanViewSubject,
} from "@/lib/auth/access";
import { generateQuestions } from "@/lib/ai/questionGenerator";
import { reviewAnswer } from "@/lib/ai/answerReviewer";
import {
  flattenExplanation,
  generateExplanation,
} from "@/lib/ai/explanationGenerator";
import { computeWeakTopics } from "@/lib/services/weakTopic.service";
import type {
  createPracticeTestSchema,
  listPracticeTestsQuerySchema,
  submitPracticeTestSchema,
} from "@/lib/validation/learning";

const questionSelect = {
  id: true,
  orderIndex: true,
  questionType: true,
  prompt: true,
  options: true,
  topicId: true,
  topic: { select: { id: true, name: true } },
} as const;

const testSelect = {
  id: true,
  studentId: true,
  subjectId: true,
  topicId: true,
  title: true,
  difficulty: true,
  questionType: true,
  questionCount: true,
  status: true,
  score: true,
  totalScore: true,
  startedAt: true,
  completedAt: true,
  generatedBy: true,
  createdAt: true,
  subject: { select: { id: true, name: true, code: true } },
  topic: { select: { id: true, name: true } },
} as const;

/**
 * Creates a practice test and generates its questions.
 *
 * Personalisation is assembled here, from data the student already has:
 * the chosen subject and topic, the topics they are weakest on, and the
 * questions they have previously got wrong.
 */
export async function createPracticeTest(
  actor: Actor,
  input: z.infer<typeof createPracticeTestSchema>,
) {
  const studentId =
    actor.role === "STUDENT" ? actor.studentId : (input.studentId ?? null);

  if (!studentId) {
    throw new ApiError("BAD_REQUEST", "studentId is required");
  }

  if (actor.role === "PARENT") {
    throw new ApiError("FORBIDDEN", "Parents cannot create practice tests");
  }

  await assertCanAccessStudent(actor, studentId);
  await assertCanViewSubject(actor, input.subjectId);

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: {
      id: true,
      name: true,
      topics: { select: { id: true, name: true } },
    },
  });

  if (!subject) throw new ApiError("NOT_FOUND", "Subject not found");

  if (input.topicId && !subject.topics.some((t) => t.id === input.topicId)) {
    throw new ApiError("BAD_REQUEST", "That topic belongs to another subject");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { gradeLevel: true },
  });

  const weakTopicNames = input.useWeakTopics
    ? (
        await computeWeakTopics(actor, {
          studentId,
          subjectId: input.subjectId,
          limit: 5,
          includeStrong: false,
        })
      ).topics.map((t) => t.topicName)
    : [];

  const previousMistakes = await prisma.mistake.findMany({
    where: {
      studentId,
      subjectId: input.subjectId,
      ...(input.topicId ? { topicId: input.topicId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { question: true, correctAnswer: true },
  });

  const selectedTopics = input.topicId
    ? subject.topics.filter((t) => t.id === input.topicId)
    : subject.topics;

  const generated = await generateQuestions({
    subjectName: subject.name,
    topicNames: selectedTopics.map((t) => t.name),
    weakTopicNames,
    previousMistakes,
    difficulty: input.difficulty,
    questionType: input.questionType,
    count: input.questionCount,
    gradeLevel: student?.gradeLevel,
  });

  // Map a generated question back to a real topic row where the name matches.
  const topicByName = new Map(
    subject.topics.map((t) => [t.name.trim().toLowerCase(), t.id]),
  );

  const test = await prisma.practiceTest.create({
    data: {
      studentId,
      subjectId: input.subjectId,
      topicId: input.topicId,
      title:
        input.title ??
        `${subject.name} practice — ${input.difficulty.toLowerCase()}`,
      difficulty: input.difficulty,
      questionType: input.questionType,
      questionCount: generated.questions.length,
      generatedBy: generated.generatedBy,
      questions: {
        create: generated.questions.map((question, index) => ({
          orderIndex: index + 1,
          questionType: question.questionType,
          prompt: question.prompt,
          options: question.options ?? undefined,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          topicId:
            input.topicId ??
            topicByName.get(question.topicName?.trim().toLowerCase() ?? "") ??
            null,
        })),
      },
    },
    select: {
      ...testSelect,
      questions: { orderBy: { orderIndex: "asc" }, select: questionSelect },
    },
  });

  return {
    test,
    personalisation: {
      weakTopicsUsed: weakTopicNames,
      pastMistakesUsed: previousMistakes.length,
      generatedBy: generated.generatedBy,
      ...(generated.fallbackReason
        ? { aiFallbackReason: generated.fallbackReason }
        : {}),
    },
  };
}

export async function listPracticeTests(
  actor: Actor,
  filters: z.infer<typeof listPracticeTestsQuerySchema>,
) {
  let studentIds: string[];

  if (filters.studentId) {
    await assertCanAccessStudent(actor, filters.studentId);
    studentIds = [filters.studentId];
  } else {
    studentIds = await accessibleStudentIds(actor);
  }

  return prisma.practiceTest.findMany({
    where: {
      studentId: { in: studentIds },
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { ...testSelect, _count: { select: { questions: true } } },
  });
}

/**
 * Returns one practice test. Correct answers and explanations are withheld
 * until the test has been completed, so the answer key cannot be read ahead.
 */
export async function getPracticeTest(actor: Actor, testId: string) {
  const test = await prisma.practiceTest.findUnique({
    where: { id: testId },
    select: {
      ...testSelect,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: {
          ...questionSelect,
          studentAnswer: true,
          isCorrect: true,
          correctAnswer: true,
          explanation: true,
        },
      },
    },
  });

  if (!test?.studentId) {
    throw new ApiError("NOT_FOUND", "Practice test not found");
  }
  await assertCanAccessStudent(actor, test.studentId);

  if (test.status === "COMPLETED") return test;

  return {
    ...test,
    questions: test.questions.map(
      ({ correctAnswer, explanation, isCorrect, ...rest }) => {
        void correctAnswer;
        void explanation;
        void isCorrect;
        return rest;
      },
    ),
  };
}

export async function startPracticeTest(actor: Actor, testId: string) {
  const test = await prisma.practiceTest.findUnique({
    where: { id: testId },
    select: { id: true, studentId: true, status: true },
  });

  if (!test) throw new ApiError("NOT_FOUND", "Practice test not found");

  if (
    actor.role !== "STUDENT" ||
    !test.studentId ||
    actor.studentId !== test.studentId
  ) {
    throw new ApiError("FORBIDDEN", "Only the student can start this test");
  }

  if (test.status === "COMPLETED") {
    throw new ApiError("CONFLICT", "This test has already been completed");
  }

  return prisma.practiceTest.update({
    where: { id: testId },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
    select: testSelect,
  });
}

/**
 * Marks a submitted test.
 *
 * Multiple choice and true/false answers are compared directly — no AI call is
 * made for them. Only free text that does not match exactly is reviewed by the
 * model, and each wrong answer gets an explanation plus a recorded mistake so
 * it feeds weak-topic detection.
 */
export async function submitPracticeTest(
  actor: Actor,
  testId: string,
  input: z.infer<typeof submitPracticeTestSchema>,
) {
  const test = await prisma.practiceTest.findUnique({
    where: { id: testId },
    select: {
      id: true,
      studentId: true,
      status: true,
      subjectId: true,
      subject: { select: { name: true } },
      questions: {
        select: {
          id: true,
          prompt: true,
          questionType: true,
          correctAnswer: true,
          explanation: true,
          topicId: true,
          topic: { select: { name: true } },
        },
      },
    },
  });

  if (!test) throw new ApiError("NOT_FOUND", "Practice test not found");

  if (
    actor.role !== "STUDENT" ||
    !test.studentId ||
    actor.studentId !== test.studentId
  ) {
    throw new ApiError("FORBIDDEN", "Only the student can submit this test");
  }

  // Narrowed above; keeps the owner non-null for the writes below.
  const ownerStudentId = test.studentId;

  if (test.status === "COMPLETED") {
    throw new ApiError("CONFLICT", "This test has already been submitted");
  }

  const questionById = new Map(test.questions.map((q) => [q.id, q]));
  const unknown = input.answers.find((a) => !questionById.has(a.questionId));

  if (unknown) {
    throw new ApiError(
      "BAD_REQUEST",
      "One or more answers do not belong to this test",
    );
  }

  const answerByQuestion = new Map(
    input.answers.map((a) => [a.questionId, a.answer]),
  );

  const graded: {
    question: (typeof test.questions)[number];
    studentAnswer: string;
    isCorrect: boolean;
    explanation: string | null;
    reviewedBy: string;
  }[] = [];
  let correctCount = 0;
  let aiCalls = 0;

  for (const question of test.questions) {
    const studentAnswer = answerByQuestion.get(question.id) ?? "";

    const review = await reviewAnswer({
      question: question.prompt,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      questionType: question.questionType,
    });

    if (review.reviewedBy === "gemini") aiCalls += 1;
    if (review.isCorrect) correctCount += 1;

    let explanation: string | null = question.explanation;

    if (!review.isCorrect) {
      // Only generate an explanation when one is not already stored.
      if (!explanation) {
        const generated = await generateExplanation({
          subjectName: test.subject.name,
          topicName: question.topic?.name,
          question: question.prompt,
          studentAnswer: studentAnswer || "(no answer)",
          correctAnswer: question.correctAnswer,
        });
        explanation = flattenExplanation(generated);
        if (generated.generatedBy === "gemini") aiCalls += 1;
      }
    }

    graded.push({
      question,
      studentAnswer,
      isCorrect: review.isCorrect,
      explanation,
      reviewedBy: review.reviewedBy,
    });
  }

  const completedAt = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of graded) {
      await tx.practiceQuestion.update({
        where: { id: item.question.id },
        data: {
          studentAnswer: item.studentAnswer,
          isCorrect: item.isCorrect,
          explanation: item.explanation,
        },
      });
    }

    // Wrong answers become mistakes so they feed weak-topic detection.
    const wrong = graded.filter((item) => !item.isCorrect);

    if (wrong.length > 0) {
      await tx.mistake.createMany({
        data: wrong.map((item) => ({
          studentId: ownerStudentId,
          subjectId: test.subjectId,
          topicId: item.question.topicId,
          question: item.question.prompt,
          studentAnswer: item.studentAnswer || "(no answer)",
          correctAnswer: item.question.correctAnswer,
          explanation: item.explanation,
          source: "PRACTICE" as const,
          sourceId: test.id,
        })),
      });
    }

    return tx.practiceTest.update({
      where: { id: testId },
      data: {
        status: "COMPLETED",
        score: correctCount,
        totalScore: test.questions.length,
        completedAt,
        ...(test.status === "DRAFT" ? { startedAt: completedAt } : {}),
      },
      select: testSelect,
    });
  });

  return {
    test: updated,
    score: {
      correct: correctCount,
      total: test.questions.length,
      percentage: Math.round((correctCount / test.questions.length) * 100),
    },
    incorrect: graded
      .filter((item) => !item.isCorrect)
      .map((item) => ({
        questionId: item.question.id,
        prompt: item.question.prompt,
        studentAnswer: item.studentAnswer,
        correctAnswer: item.question.correctAnswer,
        explanation: item.explanation,
        topic: item.question.topic?.name ?? null,
      })),
    aiCalls,
  };
}

/** On-demand explanation for one already-answered question. */
export async function explainPracticeQuestion(
  actor: Actor,
  questionId: string,
) {
  const question = await prisma.practiceQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      prompt: true,
      correctAnswer: true,
      studentAnswer: true,
      isCorrect: true,
      explanation: true,
      topic: { select: { name: true } },
      practiceTest: {
        select: {
          studentId: true,
          status: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  if (!question?.practiceTest.studentId) {
    throw new ApiError("NOT_FOUND", "Question not found");
  }
  await assertCanAccessStudent(actor, question.practiceTest.studentId);

  if (question.practiceTest.status !== "COMPLETED") {
    throw new ApiError(
      "CONFLICT",
      "Explanations are available once the test is submitted",
    );
  }

  if (question.explanation) {
    return { questionId: question.id, explanation: question.explanation, cached: true };
  }

  const generated = await generateExplanation({
    subjectName: question.practiceTest.subject.name,
    topicName: question.topic?.name,
    question: question.prompt,
    studentAnswer: question.studentAnswer ?? "(no answer)",
    correctAnswer: question.correctAnswer,
  });

  const explanation = flattenExplanation(generated);

  await prisma.practiceQuestion.update({
    where: { id: questionId },
    data: { explanation },
  });

  return {
    questionId: question.id,
    explanation,
    detail: generated,
    cached: false,
  };
}
