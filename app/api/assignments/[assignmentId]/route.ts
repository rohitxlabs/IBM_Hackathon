import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateAssignmentSchema } from "@/lib/validation/academic";
import {
  deleteAssignment,
  getAssignment,
  updateAssignment,
} from "@/lib/services/assignment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ assignmentId: string }> };

/** GET /api/assignments/:id — detail, with the student's own submission. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;
    const actor = await requireActor();
    return ok({ assignment: await getAssignment(actor, assignmentId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/assignments/:id — owning teacher only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateAssignmentSchema);
    return ok({
      assignment: await updateAssignment(actor, assignmentId, input),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/assignments/:id — owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;
    const actor = await requireActor();
    return ok(await deleteAssignment(actor, assignmentId));
  } catch (error) {
    return handleApiError(error);
  }
}
