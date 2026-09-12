import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { assignQuizSchema } from "@/lib/validation/quiz";
import { assignQuiz } from "@/lib/services/quiz.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ quizId: string }> };

/**
 * POST /api/quizzes/:quizId/assign — puts an approved quiz in front of a
 * class, named students, or both.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { quizId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, assignQuizSchema);
    return ok({ assignments: await assignQuiz(actor, quizId, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
