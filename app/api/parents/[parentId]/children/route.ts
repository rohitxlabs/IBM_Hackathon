import type { NextRequest } from "next/server";
import { ApiError, ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireParent } from "@/lib/auth/actor";
import { linkChildSchema } from "@/lib/validation/user";
import { linkChild, listChildren } from "@/lib/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ parentId: string }> };

async function requireSelf(parentId: string) {
  const actor = await requireParent();
  if (actor.parentId !== parentId) {
    throw new ApiError("FORBIDDEN", "You can only manage your own children");
  }
  return actor;
}

/** GET /api/parents/:parentId/children — the parent's linked children. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { parentId } = await params;
    const actor = await requireSelf(parentId);
    return ok({ children: await listChildren(actor) });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/parents/:parentId/children — links a child. Requires a matching
 * roll number and student email so a parent cannot claim an arbitrary student.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { parentId } = await params;
    const actor = await requireSelf(parentId);
    const input = await parseJsonBody(request, linkChildSchema);
    return ok({ link: await linkChild(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
