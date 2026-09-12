import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateExamSchema } from "@/lib/validation/academic";
import { deleteExam, getExam, updateExam } from "@/lib/services/exam.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ examId: string }> };

/** GET /api/exams/:examId — a student also receives their own result. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const actor = await requireActor();
    return ok({ exam: await getExam(actor, examId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/exams/:examId — owning teacher only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateExamSchema);
    return ok({ exam: await updateExam(actor, examId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/exams/:examId — owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const actor = await requireActor();
    return ok(await deleteExam(actor, examId));
  } catch (error) {
    return handleApiError(error);
  }
}
