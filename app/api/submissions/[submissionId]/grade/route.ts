import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { gradeSubmissionSchema } from "@/lib/validation/academic";
import { gradeSubmission } from "@/lib/services/assignment.service";

export const runtime = "nodejs";

type Params = { params: Promise<{ submissionId: string }> };

/** POST /api/submissions/:id/grade — owning teacher records a score. */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { submissionId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, gradeSubmissionSchema);
    return ok({ submission: await gradeSubmission(actor, submissionId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}
