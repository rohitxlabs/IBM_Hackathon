import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { deleteMistake } from "@/lib/services/mistake.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ mistakeId: string }> };

/** DELETE /api/mistakes/:mistakeId */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { mistakeId } = await params;
    const actor = await requireActor();
    return ok(await deleteMistake(actor, mistakeId));
  } catch (error) {
    return handleApiError(error);
  }
}
