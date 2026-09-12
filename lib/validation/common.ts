import { z } from "zod";

export const idSchema = z.string().min(1, "id is required").max(64);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function paginationArgs({ page, pageSize }: Pagination) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
