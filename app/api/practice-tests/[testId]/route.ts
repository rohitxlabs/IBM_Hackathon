import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { getPracticeTest } from "@/lib/services/practice.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ testId: string }> };

/**
 * GET /api/practice-tests/:testId — correct answers and explanations are
 * withheld until the test has been submitted.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { testId } = await params;
    const actor = await requireActor();
    return ok({ test: await getPracticeTest(actor, testId) });
  } catch (error) {
    return handleApiError(error);
  }
}
