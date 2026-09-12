import { z } from "zod";

export const updateAccountSchema = z
  .object({
    name: z.string().min(2).max(120).trim().optional(),
    avatarUrl: z.url().max(500).nullable().optional(),
  })
  .strict();

export const updateStudentProfileSchema = updateAccountSchema
  .extend({
    gradeLevel: z.coerce.number().int().min(1).max(12).optional(),
    dateOfBirth: z.coerce.date().nullable().optional(),
  })
  .strict();

export const updateTeacherProfileSchema = updateAccountSchema
  .extend({
    department: z.string().max(120).trim().nullable().optional(),
    bio: z.string().max(1000).trim().nullable().optional(),
  })
  .strict();

export const updateParentProfileSchema = updateAccountSchema
  .extend({
    phone: z.string().min(6).max(30).trim().nullable().optional(),
    occupation: z.string().max(120).trim().nullable().optional(),
  })
  .strict();

/**
 * Linking a child requires two matching identifiers so that a parent cannot
 * attach themselves to an arbitrary student by guessing a roll number.
 */
export const linkChildSchema = z
  .object({
    rollNumber: z.string().min(2).max(40).trim(),
    studentEmail: z.email().toLowerCase().trim(),
    relationship: z
      .enum(["MOTHER", "FATHER", "GUARDIAN"])
      .default("GUARDIAN"),
    isPrimary: z.boolean().default(false),
  })
  .strict();

export type LinkChildInput = z.infer<typeof linkChildSchema>;
