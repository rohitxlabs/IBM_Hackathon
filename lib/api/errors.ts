import { ApiRequestError } from "./client";

/**
 * Turns any thrown value into a sentence worth showing a user.
 *
 * Validation failures from the backend carry per-field details; the first one
 * is surfaced because a form error is more useful than "invalid payload".
 */
export function messageFromError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!(error instanceof ApiRequestError)) return fallback;

  if (error.code === "NETWORK_ERROR") {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  if (error.code === "VALIDATION_ERROR" && Array.isArray(error.details)) {
    const first = error.details[0] as { message?: string } | undefined;
    if (first?.message) return first.message;
  }

  return error.message || fallback;
}

/** Field-level messages keyed by input name, for inline form errors. */
export function fieldErrorsFromError(
  error: unknown,
): Record<string, string> {
  if (!(error instanceof ApiRequestError)) return {};
  if (error.code !== "VALIDATION_ERROR" || !Array.isArray(error.details)) {
    return {};
  }

  const errors: Record<string, string> = {};

  for (const issue of error.details as {
    path?: (string | number)[];
    message?: string;
  }[]) {
    const field = issue.path?.[0];
    if (typeof field === "string" && issue.message && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}
