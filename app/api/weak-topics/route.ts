import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { weakTopicsQuerySchema } from "@/lib/validation/learning";
import { computeWeakTopics } from "@/lib/services/weakTopic.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/weak-topics — deterministic weak-topic detection from mistake
 * frequency, practice accuracy and graded performance. No AI call is made.
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, weakTopicsQuerySchema);
    return ok(await computeWeakTopics(actor, filters));
  } catch (error) {
    return handleApiError(error);
  }
}
