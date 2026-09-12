import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { markMessageRead } from "@/lib/services/message.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ messageId: string }> };

/** POST /api/messages/:messageId/read — recipient marks a message read. */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { messageId } = await params;
    const actor = await requireActor();
    return ok({ message: await markMessageRead(actor, messageId) });
  } catch (error) {
    return handleApiError(error);
  }
}
