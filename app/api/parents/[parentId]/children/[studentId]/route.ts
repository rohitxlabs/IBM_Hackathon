import type { NextRequest } from "next/server";
import { ApiError, ok, handleApiError } from "@/lib/api/response";
import { requireParent } from "@/lib/auth/actor";
import { unlinkChild } from "@/lib/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ parentId: string; studentId: string }> };

/** DELETE /api/parents/:parentId/children/:studentId — removes a link. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { parentId, studentId } = await params;
    const actor = await requireParent();

    if (actor.parentId !== parentId) {
      throw new ApiError("FORBIDDEN", "You can only manage your own children");
    }

    return ok(await unlinkChild(actor, studentId));
  } catch (error) {
    return handleApiError(error);
  }
}
