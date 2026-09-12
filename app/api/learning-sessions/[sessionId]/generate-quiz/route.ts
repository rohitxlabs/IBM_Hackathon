import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireTeacher } from "@/lib/auth/actor";
import { generateQuizFromSessionSchema } from "@/lib/validation/learningSession";
import { generateQuizFromSession } from "@/lib/services/quiz.service";

export const runtime = "nodejs";
// Gemini calls run past the default serverless timeout budget.
export const maxDuration = 60;

/**
 * POST /api/learning-sessions/:sessionId/generate-quiz — asks Gemini for a
 * concept-tagged quiz from the session's material. The quiz is created in
 * PENDING_REVIEW: students cannot see it until the teacher approves it.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const actor = await requireTeacher();
    const { count } = await parseJsonBody(
      request,
      generateQuizFromSessionSchema,
    );
    return ok(
      await generateQuizFromSession(actor, sessionId, count),
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
