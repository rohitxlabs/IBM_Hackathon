import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import {
  createTopicSchema,
  listTopicsQuerySchema,
} from "@/lib/validation/academic";
import { createTopic, listTopics } from "@/lib/services/subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/topics — optionally filtered by subject. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listTopicsQuerySchema);
    return ok({ topics: await listTopics(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/topics — teacher who owns the subject. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor();
    const input = await parseJsonBody(request, createTopicSchema);
    return ok({ topic: await createTopic(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
