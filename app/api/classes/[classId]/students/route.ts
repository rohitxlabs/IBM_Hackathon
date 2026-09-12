import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { addClassStudentSchema } from "@/lib/validation/class";
import {
  addClassStudent,
  listClassStudents,
} from "@/lib/services/class.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ classId: string }> };

/** GET /api/classes/:classId/students — roster, for anyone who may view it. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { classId } = await params;
    const actor = await requireActor();
    return ok({ students: await listClassStudents(actor, classId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/classes/:classId/students — owning teacher enrols a student. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { classId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, addClassStudentSchema);
    return ok({ enrolment: await addClassStudent(actor, classId, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
