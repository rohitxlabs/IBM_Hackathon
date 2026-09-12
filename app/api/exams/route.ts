import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor, requireTeacher } from "@/lib/auth/actor";
import {
  createExamSchema,
  listExamsQuerySchema,
} from "@/lib/validation/academic";
import { createExam, listExams } from "@/lib/services/exam.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/exams — role-scoped; ?scope=UPCOMING|PAST|ALL. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listExamsQuerySchema);
    return ok({ exams: await listExams(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/exams — teacher who owns the class. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const input = await parseJsonBody(request, createExamSchema);
    return ok({ exam: await createExam(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
