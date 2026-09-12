import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateStudentProfileSchema } from "@/lib/validation/user";
import {
  getStudentProfile,
  updateStudentProfile,
} from "@/lib/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ studentId: string }> };

/** GET /api/students/:studentId — self, linked parent or owning teacher. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { studentId } = await params;
    const actor = await requireActor();
    return ok({ student: await getStudentProfile(actor, studentId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/students/:studentId — the student themselves only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { studentId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateStudentProfileSchema);
    return ok({ student: await updateStudentProfile(actor, studentId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}
