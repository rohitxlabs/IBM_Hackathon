import { z } from "zod";

export const createLearningSessionSchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64),
    topicId: z.string().min(1).max(64).optional(),
    title: z.string().min(3).max(200).trim(),
    material: z.string().min(20).max(20000).trim(),
    gradeLevel: z.coerce.number().int().min(1).max(12),
  })
  .strict();

export const generateQuizFromSessionSchema = z
  .object({
    count: z.coerce.number().int().min(3).max(20).default(10),
  })
  .strict();

export const listLearningSessionsQuerySchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
  })
  .strict();
