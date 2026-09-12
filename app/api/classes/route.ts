import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor, requireTeacher } from "@/lib/auth/actor";
import { createClassSchema } from "@/lib/validation/class";
import { createClass, listClasses } from "@/lib/services/class.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/classes — classes visible to the caller, scoped by role. */
export async function GET() {
  try {
    const actor = await requireActor();
    return ok({ classes: await listClasses(actor) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/classes — teachers only; the creator becomes the owner. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const input = await parseJsonBody(request, createClassSchema);
    return ok({ class: await createClass(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
