import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import {
  createMistakeSchema,
  listMistakesQuerySchema,
} from "@/lib/validation/learning";
import { listMistakes, recordMistake } from "@/lib/services/mistake.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/mistakes — filter by student, subject, topic, source or date, and
 * optionally group counts by topic or subject.
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listMistakesQuerySchema);
    return ok(await listMistakes(actor, filters));
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/mistakes — a student records their own, a teacher one of theirs. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor();
    const input = await parseJsonBody(request, createMistakeSchema);
    return ok({ mistake: await recordMistake(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
