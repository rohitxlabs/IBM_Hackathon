import { z } from "zod";

/* ------------------------------- subjects ------------------------------- */

export const createSubjectSchema = z
  .object({
    name: z.string().min(2).max(120).trim(),
    code: z.string().min(2).max(40).trim().toUpperCase(),
    description: z.string().max(1000).trim().optional(),
    classId: z.string().min(1).max(64).optional(),
  })
  .strict();

export const updateSubjectSchema = z
  .object({
    name: z.string().min(2).max(120).trim().optional(),
    code: z.string().min(2).max(40).trim().toUpperCase().optional(),
    description: z.string().max(1000).trim().nullable().optional(),
    classId: z.string().min(1).max(64).nullable().optional(),
  })
  .strict();

export const listSubjectsQuerySchema = z
  .object({ classId: z.string().min(1).max(64).optional() })
  .strict();

/* -------------------------------- topics -------------------------------- */

export const createTopicSchema = z
  .object({
    subjectId: z.string().min(1).max(64),
    name: z.string().min(2).max(120).trim(),
    description: z.string().max(1000).trim().optional(),
    orderIndex: z.coerce.number().int().min(0).max(999).default(0),
  })
  .strict();

export const updateTopicSchema = z
  .object({
    name: z.string().min(2).max(120).trim().optional(),
    description: z.string().max(1000).trim().nullable().optional(),
    orderIndex: z.coerce.number().int().min(0).max(999).optional(),
  })
  .strict();

export const listTopicsQuerySchema = z
  .object({ subjectId: z.string().min(1).max(64).optional() })
  .strict();

/* ----------------------------- assignments ------------------------------ */

export const createAssignmentSchema = z
  .object({
    title: z.string().min(3).max(200).trim(),
    description: z.string().min(1).max(5000).trim(),
    classId: z.string().min(1).max(64),
    subjectId: z.string().min(1).max(64),
    topicId: z.string().min(1).max(64).optional(),
    dueDate: z.coerce.date(),
    maxScore: z.coerce.number().int().min(1).max(1000).default(100),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const updateAssignmentSchema = z
  .object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(1).max(5000).trim().optional(),
    topicId: z.string().min(1).max(64).nullable().optional(),
    dueDate: z.coerce.date().optional(),
    maxScore: z.coerce.number().int().min(1).max(1000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export const listAssignmentsQuerySchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    studentId: z.string().min(1).max(64).optional(),
    status: z.enum(["PENDING", "SUBMITTED", "LATE", "GRADED"]).optional(),
  })
  .strict();

/* ----------------------------- submissions ------------------------------ */

export const submitAssignmentSchema = z
  .object({
    content: z.string().min(1).max(20000).trim().optional(),
    fileUrl: z.url().max(1000).optional(),
  })
  .strict()
  .refine((v) => Boolean(v.content || v.fileUrl), {
    message: "Provide submission content or a file URL",
  });

export const gradeSubmissionSchema = z
  .object({
    score: z.coerce.number().int().min(0).max(1000),
    feedback: z.string().max(5000).trim().optional(),
  })
  .strict();

/* --------------------------------- exams -------------------------------- */

export const createExamSchema = z
  .object({
    title: z.string().min(3).max(200).trim(),
    description: z.string().max(2000).trim().optional(),
    classId: z.string().min(1).max(64),
    subjectId: z.string().min(1).max(64),
    topicId: z.string().min(1).max(64).optional(),
    examType: z
      .enum(["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "PRACTICAL"])
      .default("UNIT_TEST"),
    examDate: z.coerce.date(),
    durationMinutes: z.coerce.number().int().min(5).max(600).default(60),
    maxScore: z.coerce.number().int().min(1).max(1000).default(100),
  })
  .strict();

export const updateExamSchema = z
  .object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().max(2000).trim().nullable().optional(),
    topicId: z.string().min(1).max(64).nullable().optional(),
    examType: z
      .enum(["QUIZ", "UNIT_TEST", "MIDTERM", "FINAL", "PRACTICAL"])
      .optional(),
    examDate: z.coerce.date().optional(),
    durationMinutes: z.coerce.number().int().min(5).max(600).optional(),
    maxScore: z.coerce.number().int().min(1).max(1000).optional(),
  })
  .strict();

export const listExamsQuerySchema = z
  .object({
    classId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
    studentId: z.string().min(1).max(64).optional(),
    scope: z.enum(["ALL", "UPCOMING", "PAST"]).default("ALL"),
  })
  .strict();

export const recordExamResultSchema = z
  .object({
    studentId: z.string().min(1).max(64),
    score: z.coerce.number().int().min(0).max(1000),
    grade: z.string().max(5).trim().optional(),
    remarks: z.string().max(2000).trim().optional(),
  })
  .strict();

export const recordExamResultsSchema = z
  .object({
    results: z.array(recordExamResultSchema).min(1).max(200),
  })
  .strict();

export const listResultsQuerySchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    subjectId: z.string().min(1).max(64).optional(),
  })
  .strict();
