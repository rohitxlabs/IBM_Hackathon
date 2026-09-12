import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { requireActor } from "@/lib/auth/actor";
import { computeStudentProgress } from "@/lib/services/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ studentId: string }> };

/**
 * GET /api/students/:studentId/progress — progress derived from academic
 * records at read time. Nothing is stored, so nothing can go stale.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { studentId } = await params;
    const actor = await requireActor();
    return ok({ progress: await computeStudentProgress(actor, studentId) });
  } catch (error) {
    return handleApiError(error);
  }
}
