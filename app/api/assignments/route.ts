import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor, requireTeacher } from "@/lib/auth/actor";
import {
  createAssignmentSchema,
  listAssignmentsQuerySchema,
} from "@/lib/validation/academic";
import {
  createAssignment,
  listAssignments,
} from "@/lib/services/assignment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/assignments — role-scoped. A student sees their own submission
 * status on each row; a parent can pass ?studentId= for a linked child.
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listAssignmentsQuerySchema);
    return ok({ assignments: await listAssignments(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/assignments — teacher who owns the class. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const input = await parseJsonBody(request, createAssignmentSchema);
    return ok({ assignment: await createAssignment(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
