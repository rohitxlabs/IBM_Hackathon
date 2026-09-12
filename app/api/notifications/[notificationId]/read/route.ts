import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { markNotificationRead } from "@/lib/services/notification.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ notificationId: string }> };

/** POST /api/notifications/:notificationId/read */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { notificationId } = await params;
    const actor = await requireActor();
    return ok({
      notification: await markNotificationRead(actor, notificationId),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
