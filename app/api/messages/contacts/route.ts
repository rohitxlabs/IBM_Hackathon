import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { listContacts } from "@/lib/services/message.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/messages/contacts — who the caller may message, per student. */
export async function GET() {
  try {
    const actor = await requireActor();
    return ok({ contacts: await listContacts(actor) });
  } catch (error) {
    return handleApiError(error);
  }
}
