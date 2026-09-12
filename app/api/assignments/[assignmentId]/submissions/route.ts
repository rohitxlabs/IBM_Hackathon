import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor, requireStudent } from "@/lib/auth/actor";
import { z } from "zod";
import { submitAssignmentSchema } from "@/lib/validation/academic";
import {
  getSubmission,
  listAssignmentSubmissions,
  submitAssignment,
} from "@/lib/services/assignment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ assignmentId: string }> };

const submissionQuerySchema = z
  .object({ studentId: z.string().min(1).max(64).optional() })
  .strict();

/**
 * GET /api/assignments/:id/submissions
 * Owning teacher: every submission plus who has not handed in.
 * Student or parent: the one submission they are entitled to see.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;
    const actor = await requireActor();
    const { studentId } = parseQuery(request, submissionQuerySchema);

    if (actor.role === "TEACHER" && !studentId) {
      return ok(await listAssignmentSubmissions(actor, assignmentId));
    }

    const target =
      studentId ?? (actor.role === "STUDENT" ? actor.studentId : null);

    if (!target) {
      return ok(await listAssignmentSubmissions(actor, assignmentId));
    }

    return ok({ submission: await getSubmission(actor, assignmentId, target) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/assignments/:id/submissions — enrolled student submits work. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { assignmentId } = await params;
    const actor = await requireStudent();
    const input = await parseJsonBody(request, submitAssignmentSchema);
    return ok(
      { submission: await submitAssignment(actor, assignmentId, input) },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
