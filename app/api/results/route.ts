import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { listResultsQuerySchema } from "@/lib/validation/academic";
import { listStudentResults } from "@/lib/services/exam.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/results — exam results across exams for the students the caller may
 * see: their own, a parent's linked children, or a teacher's class members.
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listResultsQuerySchema);
    return ok({ results: await listStudentResults(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}
