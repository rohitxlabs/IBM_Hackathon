import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { removeClassStudent } from "@/lib/services/class.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ classId: string; studentId: string }> };

/** DELETE /api/classes/:classId/students/:studentId — owning teacher only. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { classId, studentId } = await params;
    const actor = await requireActor();
    return ok(await removeClassStudent(actor, classId, studentId));
  } catch (error) {
    return handleApiError(error);
  }
}
