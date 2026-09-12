import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateTeacherProfileSchema } from "@/lib/validation/user";
import {
  getTeacherProfile,
  updateTeacherProfile,
} from "@/lib/services/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ teacherId: string }> };

/** GET /api/teachers/:teacherId — self, or a connected student/parent. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { teacherId } = await params;
    const actor = await requireActor();
    return ok({ teacher: await getTeacherProfile(actor, teacherId) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/teachers/:teacherId — the teacher themselves only. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { teacherId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateTeacherProfileSchema);
    return ok({ teacher: await updateTeacherProfile(actor, teacherId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}
