import { z } from "zod";

export const createClassSchema = z
  .object({
    name: z.string().min(2).max(80).trim(),
    section: z.string().min(1).max(10).trim(),
    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/, "Academic year must look like 2025-2026"),
    gradeLevel: z.coerce.number().int().min(1).max(12),
  })
  .strict();

export const updateClassSchema = createClassSchema.partial().strict();

export const addClassStudentSchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    rollNumber: z.string().min(2).max(40).trim().optional(),
  })
  .strict()
  .refine((v) => Boolean(v.studentId || v.rollNumber), {
    message: "Provide either studentId or rollNumber",
  });

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type AddClassStudentInput = z.infer<typeof addClassStudentSchema>;
