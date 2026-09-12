import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { regenerateQuizQuestion } from "@/lib/services/quiz.service";

export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { params: Promise<{ quizId: string; questionId: string }> };

/** POST /api/quizzes/:quizId/questions/:questionId/regenerate */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { quizId, questionId } = await params;
    const actor = await requireActor();
    return ok(await regenerateQuizQuestion(actor, quizId, questionId));
  } catch (error) {
    return handleApiError(error);
  }
}
