import { ok, fail, handleApiError } from "@/lib/api/response";
import { getActor } from "@/lib/auth/actor";
import { actorToPublicUser } from "@/lib/services/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — the currently authenticated user, or 401. */
export async function GET() {
  try {
    const actor = await getActor();

    if (!actor) {
      return fail("UNAUTHORIZED", "Not authenticated");
    }

    return ok({ user: actorToPublicUser(actor) });
  } catch (error) {
    return handleApiError(error);
  }
}
