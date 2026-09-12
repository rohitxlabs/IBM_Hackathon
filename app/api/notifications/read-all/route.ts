import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { markAllNotificationsRead } from "@/lib/services/notification.service";

export const runtime = "nodejs";

/** POST /api/notifications/read-all */
export async function POST() {
  try {
    const actor = await requireActor();
    return ok(await markAllNotificationsRead(actor));
  } catch (error) {
    return handleApiError(error);
  }
}
