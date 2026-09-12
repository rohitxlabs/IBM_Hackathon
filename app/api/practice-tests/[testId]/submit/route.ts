import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { submitPracticeTestSchema } from "@/lib/validation/learning";
import { submitPracticeTest } from "@/lib/services/practice.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ testId: string }> };

/**
 * POST /api/practice-tests/:testId/submit — marks the test, stores the score,
 * returns the incorrect answers with explanations and records each wrong
 * answer as a mistake.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { testId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, submitPracticeTestSchema);
    return ok(await submitPracticeTest(actor, testId, input));
  } catch (error) {
    return handleApiError(error);
  }
}
