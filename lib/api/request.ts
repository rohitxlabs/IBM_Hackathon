import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import { ApiError } from "@/lib/api/response";

/** Parses and validates a JSON body. Rejects malformed or invalid payloads. */
export async function parseJsonBody<T>(
  request: NextRequest,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new ApiError("BAD_REQUEST", "Request body must be valid JSON");
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid request payload",
      result.error.issues,
    );
  }

  return result.data;
}

/** Parses and validates query string parameters. */
export function parseQuery<T>(request: NextRequest, schema: ZodType<T>): T {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid query parameters",
      result.error.issues,
    );
  }

  return result.data;
}
