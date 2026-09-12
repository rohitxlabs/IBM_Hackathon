import { ok, handleApiError } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

/** POST /api/auth/logout — clears the session cookie. Always safe to call. */
export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}
