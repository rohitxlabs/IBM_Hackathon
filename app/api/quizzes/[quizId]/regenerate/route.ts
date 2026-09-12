import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { regenerateQuiz } from "@/lib/services/quiz.service";

export const runtime = "nodejs";
export const maxDuration = 60;

type Params = { params: Promise<{ quizId: string }> };

/** POST /api/quizzes/:quizId/regenerate — rebuilds every question. */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { quizId } = await params;
    const actor = await requireActor();
    return ok({ quiz: await regenerateQuiz(actor, quizId) });
  } catch (error) {
    return handleApiError(error);
  }
}
