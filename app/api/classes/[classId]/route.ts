import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateClassSchema } from "@/lib/validation/class";
import { deleteClass, getClass, updateClass } from "@/lib/services/class.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ classId: string }> };

/** GET /api/classes/:classId — owning teacher, enrolled student, or parent. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { classId } = await params;
    const actor = await requireActor();
    return ok({ class: await getClass(actor, classId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/classes/:classId — owning teacher only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { classId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateClassSchema);
    return ok({ class: await updateClass(actor, classId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/classes/:classId — owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { classId } = await params;
    const actor = await requireActor();
    return ok(await deleteClass(actor, classId));
  } catch (error) {
    return handleApiError(error);
  }
}
