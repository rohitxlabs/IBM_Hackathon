import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { explainPracticeQuestion } from "@/lib/services/practice.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ questionId: string }> };

/**
 * POST /api/practice-questions/:questionId/explain — returns the stored
 * explanation, or generates one on demand for a completed test.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { questionId } = await params;
    const actor = await requireActor();
    return ok(await explainPracticeQuestion(actor, questionId));
  } catch (error) {
    return handleApiError(error);
  }
}
