/** Prisma error-code helpers shared by the service layer. */

function hasCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

/** P2002 — unique constraint violated. */
export function isUniqueViolation(error: unknown): boolean {
  return hasCode(error, "P2002");
}

/** P2003 — foreign key constraint violated. */
export function isForeignKeyViolation(error: unknown): boolean {
  return hasCode(error, "P2003");
}

/** P2025 — record required for the operation was not found. */
export function isRecordNotFound(error: unknown): boolean {
  return hasCode(error, "P2025");
}
