import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateParentProfileSchema } from "@/lib/validation/user";
import {
  getParentProfile,
  updateParentProfile,
} from "@/lib/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ parentId: string }> };

/** GET /api/parents/:parentId — self, or a teacher of one of their children. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { parentId } = await params;
    const actor = await requireActor();
    return ok({ parent: await getParentProfile(actor, parentId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/parents/:parentId — the parent themselves only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { parentId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateParentProfileSchema);
    return ok({ parent: await updateParentProfile(actor, parentId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}
