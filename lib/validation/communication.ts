import { z } from "zod";

export const sendMessageSchema = z
  .object({
    recipientUserId: z.string().min(1).max(64),
    studentId: z.string().min(1).max(64),
    body: z.string().min(1).max(4000).trim(),
  })
  .strict();

export const listMessagesQuerySchema = z
  .object({
    studentId: z.string().min(1).max(64).optional(),
    withUserId: z.string().min(1).max(64).optional(),
    unreadOnly: z.coerce.boolean().default(false),
    limit: z.coerce.number().int().min(1).max(200).default(50),
  })
  .strict();

export const listNotificationsQuerySchema = z
  .object({
    unreadOnly: z.coerce.boolean().default(false),
    type: z.enum(["ASSIGNMENT", "GRADE", "EXAM", "MESSAGE"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(30),
  })
  .strict();
