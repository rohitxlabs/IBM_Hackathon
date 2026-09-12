import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireTeacher } from "@/lib/auth/actor";
import { generateTopicQuizSchema } from "@/lib/validation/quiz";
import { generateQuizFromTopic } from "@/lib/services/quiz.service";

export const runtime = "nodejs";

/**
 * POST /api/quizzes/generate-from-topic
 * Teacher provides a free-text topic (+ subject/class/grade/difficulty) → AI
 * generates N MCQ questions (default 10) and creates a PracticeTest with
 * kind=TEACHER_ASSIGNED and reviewStatus=PENDING_REVIEW. If `assignToClass`
 * is true and a classId is provided, the quiz is APPROVED and assigned to
 * that class in a single call — that's the "only students can see it"
 * guarantee: nothing leaks before assignment.
 */
export async function POST(request: NextRequest) {
  try {
    const teacher = await requireTeacher();
    const input = await parseJsonBody(request, generateTopicQuizSchema);
    const result = await generateQuizFromTopic(teacher, input);
    return ok(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
