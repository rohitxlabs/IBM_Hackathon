import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { buildDashboard } from "@/lib/services/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard — one endpoint that returns the payload for whichever
 * role the session belongs to. The role comes from the session, never the
 * request, so a caller cannot ask for another role's dashboard.
 */
export async function GET() {
  try {
    const actor = await requireActor();
    return ok(await buildDashboard(actor));
  } catch (error) {
    return handleApiError(error);
  }
}
