import { z } from "zod";

/* ------------------------------- mistakes ------------------------------- */

export const createMistakeSchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64),
    topicId: z.string().min(1).max(64).optional(),
    question: z.string().min(1).max(2000).trim(),
    studentAnswer: z.string().min(1).max(2000).trim(),
    correctAnswer: z.string().min(1).max(2000).trim(),
    explanation: z.string().max(4000).trim().optional(),
    source: z
      .enum(["ASSIGNMENT", "EXAM", "PRACTICE", "SELF_REPORTED"])
      .default("SELF_REPORTED"),
    sourceId: z.string().min(1).max(64).optional(),
  })
  .strict();

export const listMistakesQuerySchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    topicId: z.string().min(1).max(64).optional(),
    source: z
      .enum(["ASSIGNMENT", "EXAM", "PRACTICE", "SELF_REPORTED"])
      .optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    groupBy: z.enum(["NONE", "TOPIC", "SUBJECT"]).default("NONE"),
    limit: z.coerce.number().int().min(1).max(200).default(50),
  })
  .strict();

/* ------------------------------ weak topics ----------------------------- */

export const weakTopicsQuerySchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    includeStrong: z.coerce.boolean().default(false),
  })
  .strict();

/* ---------------------------- practice tests ---------------------------- */

export const createPracticeTestSchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64),
    topicId: z.string().min(1).max(64).optional(),
    title: z.string().min(3).max(200).trim().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    questionType: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]).default("MCQ"),
    questionCount: z.coerce.number().int().min(1).max(20).default(5),
    useWeakTopics: z.boolean().default(true),
  })
  .strict();

export const submitPracticeTestSchema = z
  .object({
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1).max(64),
          answer: z.string().max(2000),
        }),
      )
      .min(1)
      .max(25),
  })
  .strict();

export const listPracticeTestsQuerySchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED"]).optional(),
  })
  .strict();
