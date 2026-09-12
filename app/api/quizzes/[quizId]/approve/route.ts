import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { approveQuiz } from "@/lib/services/quiz.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ quizId: string }> };

/** POST /api/quizzes/:quizId/approve — locks the quiz in for assignment. */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { quizId } = await params;
    const actor = await requireActor();
    return ok({ quiz: await approveQuiz(actor, quizId) });
  } catch (error) {
    return handleApiError(error);
  }
}
