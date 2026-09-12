import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireTeacher } from "@/lib/auth/actor";
import {
  createLearningSessionSchema,
  listLearningSessionsQuerySchema,
} from "@/lib/validation/learningSession";
import {
  createLearningSession,
  listLearningSessions,
} from "@/lib/services/learningSession.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/learning-sessions — the teacher's own sessions. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const filters = parseQuery(request, listLearningSessionsQuerySchema);
    return ok({ sessions: await listLearningSessions(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/learning-sessions — records what a teacher taught. This is the
 * material Gemini grounds every generated question in.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const input = await parseJsonBody(request, createLearningSessionSchema);
    return ok({ session: await createLearningSession(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
