import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import {
  listMessagesQuerySchema,
  sendMessageSchema,
} from "@/lib/validation/communication";
import { listMessages, sendMessage } from "@/lib/services/message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/messages — conversations the caller is part of. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listMessagesQuerySchema);
    return ok(await listMessages(actor, filters));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/messages — a parent messages a teacher of their child, or a
 * teacher messages a parent of a student they teach. Nothing else is allowed.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor();
    const input = await parseJsonBody(request, sendMessageSchema);
    return ok({ message: await sendMessage(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
