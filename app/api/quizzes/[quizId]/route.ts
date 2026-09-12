import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateQuizSchema } from "@/lib/validation/quiz";
import { getQuizForReview, updateQuiz } from "@/lib/services/quiz.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ quizId: string }> };

/** GET /api/quizzes/:quizId — full quiz with answer key, owning teacher only. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { quizId } = await params;
    const actor = await requireActor();
    return ok({ quiz: await getQuizForReview(actor, quizId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/quizzes/:quizId — edit title/instructions. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { quizId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateQuizSchema);
    return ok({ quiz: await updateQuiz(actor, quizId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}
