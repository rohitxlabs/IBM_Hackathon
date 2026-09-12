import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { listNotificationsQuerySchema } from "@/lib/validation/communication";
import { listNotifications } from "@/lib/services/notification.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/notifications — the caller's own notifications only. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listNotificationsQuerySchema);
    return ok(await listNotifications(actor, filters));
  } catch (error) {
    return handleApiError(error);
  }
}
