import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

/** Error type that service-layer code throws and route handlers translate. */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get status(): number {
    return STATUS_BY_CODE[this.code];
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status: STATUS_BY_CODE[code] },
  );
}

/**
 * Translates anything thrown inside a route handler into a safe JSON response.
 * Unexpected errors are logged server-side and reported generically so that
 * database or stack details never reach the client.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Invalid request payload", error.issues);
  }

  console.error("[api] unhandled error:", error);
  return fail("INTERNAL_ERROR", "Something went wrong");
}
