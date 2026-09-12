import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateSubjectSchema } from "@/lib/validation/academic";
import {
  deleteSubject,
  getSubject,
  updateSubject,
} from "@/lib/services/subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ subjectId: string }> };

/** GET /api/subjects/:subjectId — includes the topic list. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { subjectId } = await params;
    const actor = await requireActor();
    return ok({ subject: await getSubject(actor, subjectId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/subjects/:subjectId — owning teacher only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { subjectId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateSubjectSchema);
    return ok({ subject: await updateSubject(actor, subjectId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/subjects/:subjectId — owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { subjectId } = await params;
    const actor = await requireActor();
    return ok(await deleteSubject(actor, subjectId));
  } catch (error) {
    return handleApiError(error);
  }
}
