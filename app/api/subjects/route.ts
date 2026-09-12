import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody, parseQuery } from "@/lib/api/request";
import { requireActor, requireTeacher } from "@/lib/auth/actor";
import {
  createSubjectSchema,
  listSubjectsQuerySchema,
} from "@/lib/validation/academic";
import { createSubject, listSubjects } from "@/lib/services/subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/subjects — subjects visible to the caller. */
export async function GET(request: NextRequest) {
  try {
    const actor = await requireActor();
    const filters = parseQuery(request, listSubjectsQuerySchema);
    return ok({ subjects: await listSubjects(actor, filters) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/subjects — teachers only. */
export async function POST(request: NextRequest) {
  try {
    const actor = await requireTeacher();
    const input = await parseJsonBody(request, createSubjectSchema);
    return ok({ subject: await createSubject(actor, input) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
