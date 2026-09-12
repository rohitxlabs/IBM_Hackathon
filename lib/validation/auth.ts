import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

const baseRegisterSchema = z.object({
  email: z.email("A valid email is required").toLowerCase().trim(),
  password: passwordSchema,
  name: z.string().min(2).max(120).trim(),
  avatarUrl: z.url().max(500).optional(),
});

export const registerSchema = z.discriminatedUnion("role", [
  baseRegisterSchema.extend({
    role: z.literal("STUDENT"),
    rollNumber: z.string().min(2).max(40).trim(),
    gradeLevel: z.coerce.number().int().min(1).max(12),
    dateOfBirth: z.coerce.date().optional(),
  }),
  baseRegisterSchema.extend({
    role: z.literal("TEACHER"),
    employeeId: z.string().min(2).max(40).trim(),
    department: z.string().max(120).trim().optional(),
    bio: z.string().max(1000).trim().optional(),
  }),
  baseRegisterSchema.extend({
    role: z.literal("PARENT"),
    phone: z.string().min(6).max(30).trim().optional(),
    occupation: z.string().max(120).trim().optional(),
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
