import { z } from "zod";

/* --------------------------- review and editing --------------------------- */

export const updateQuizQuestionSchema = z
  .object({
    prompt: z.string().min(5).max(2000).trim().optional(),
    options: z.array(z.string().min(1).max(500)).min(2).max(6).optional(),
    correctAnswer: z.string().min(1).max(500).optional(),
    explanation: z.string().max(2000).trim().nullable().optional(),
    conceptTag: z.string().min(1).max(120).trim().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  })
  .strict()
  .refine(
    (v) =>
      !v.options ||
      !v.correctAnswer ||
      v.options.some(
        (o) => o.trim().toLowerCase() === v.correctAnswer!.trim().toLowerCase(),
      ),
    { message: "correctAnswer must be one of the given options" },
  );

export const updateQuizSchema = z
  .object({
    title: z.string().min(3).max(200).trim().optional(),
    instructions: z.string().max(2000).trim().nullable().optional(),
  })
  .strict();

/* -------------------------------- assignment ------------------------------ */

export const assignQuizSchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    studentIds: z.array(z.string().min(1).max(64)).max(200).optional(),
    dueDate: z.coerce.date().optional(),
  })
  .strict()
  .refine((v) => Boolean(v.classId) || (v.studentIds && v.studentIds.length > 0), {
    message: "Provide a classId or at least one studentId",
  });

export const listQuizzesQuerySchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    kind: z.enum(["TEACHER_ASSIGNED", "PERSONALIZED", "SELF_PRACTICE"]).optional(),
    studentId: z.string().min(1).max(64).optional(),
  })
  .strict();

/* --------------------------------- attempts -------------------------------- */

export const saveAnswerSchema = z
  .object({
    questionId: z.string().min(1).max(64),
    answer: z.string().min(0).max(2000),
  })
  .strict();

export const submitAttemptSchema = z
  .object({
    answers: z.array(saveAnswerSchema).max(50).optional(),
  })
  .strict();

/* ---------------------------- topic-based generation ------------------------ */

export const generateTopicQuizSchema = z
  .object({
    topic: z.string().min(3).max(200).trim(),
    subjectId: z.string().min(1).max(64),
    classId: z.string().min(1).max(64).optional(),
    gradeLevel: z.coerce.number().int().min(1).max(13).default(8),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    questionCount: z.coerce.number().int().min(5).max(20).default(10),
    assignToClass: z.boolean().default(false),
  })
  .strict();

