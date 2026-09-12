import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/request";
import { requireStudent, requireTeacher } from "@/lib/auth/actor";
import { listQuizzesQuerySchema } from "@/lib/validation/quiz";
import { listStudentQuizzes, listTeacherQuizzes } from "@/lib/services/quiz.service";
import { getActor } from "@/lib/auth/actor";
import { ApiError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/quizzes — a teacher sees the quizzes they authored; a student
 * sees only approved quizzes assigned to them or their class.
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await getActor();
    if (!actor) throw new ApiError("UNAUTHORIZED", "Authentication required");

    const filters = parseQuery(request, listQuizzesQuerySchema);

    if (actor.role === "TEACHER") {
      const teacher = await requireTeacher();
      return ok({ quizzes: await listTeacherQuizzes(teacher, filters) });
    }

    const student = await requireStudent();
    return ok({ quizzes: await listStudentQuizzes(student) });
  } catch (error) {
    return handleApiError(error);
  }
}
