import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { recordExamResultsSchema } from "@/lib/validation/academic";
import {
  listExamResults,
  recordExamResults,
} from "@/lib/services/exam.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ examId: string }> };

/**
 * GET /api/exams/:examId/results — the owning teacher sees the whole class;
 * students and parents see only the rows they are entitled to.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const actor = await requireActor();
    return ok({ results: await listExamResults(actor, examId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/exams/:examId/results — owning teacher records scores in bulk. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, recordExamResultsSchema);
    return ok({ results: await recordExamResults(actor, examId, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
