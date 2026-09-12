import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { startPracticeTest } from "@/lib/services/practice.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ testId: string }> };

/** POST /api/practice-tests/:testId/start */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { testId } = await params;
    const actor = await requireActor();
    return ok({ test: await startPracticeTest(actor, testId) });
  } catch (error) {
    return handleApiError(error);
  }
}
