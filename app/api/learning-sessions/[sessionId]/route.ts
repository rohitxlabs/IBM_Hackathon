import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import {
  deleteLearningSession,
  getLearningSession,
} from "@/lib/services/learningSession.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ sessionId: string }> };

/** GET /api/learning-sessions/:sessionId — the owning teacher only. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const actor = await requireActor();
    return ok({ session: await getLearningSession(actor, sessionId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/learning-sessions/:sessionId — the owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const actor = await requireActor();
    return ok(await deleteLearningSession(actor, sessionId));
  } catch (error) {
    return handleApiError(error);
  }
}
