import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import {
  createPracticeTestSchema,
  listPracticeTestsQuerySchema,
} from "@/lib/validation/learning";
import {
  createPracticeTest,
  listPracticeTests,
} from "@/lib/services/practice.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/practice-tests — the caller's tests, or a linked student's. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listPracticeTestsQuerySchema);
    return ok({ tests: await listPracticeTests(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/practice-tests — creates a test and generates its questions,
 * personalised with the student's weak topics and previous mistakes.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor();
    const input = await parseJsonBody(request, createPracticeTestSchema);
    return ok(await createPracticeTest(actor, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
