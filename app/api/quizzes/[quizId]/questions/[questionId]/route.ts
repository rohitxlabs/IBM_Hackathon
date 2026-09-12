import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateQuizQuestionSchema } from "@/lib/validation/quiz";
import { updateQuizQuestion } from "@/lib/services/quiz.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ quizId: string; questionId: string }> };

/**
 * PATCH /api/quizzes/:quizId/questions/:questionId — the teacher edits a
 * generated question before approving the quiz.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { quizId, questionId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateQuizQuestionSchema);
    return ok({
      question: await updateQuizQuestion(actor, quizId, questionId, input),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
