import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireActor } from "@/lib/auth/actor";
import { updateTopicSchema } from "@/lib/validation/academic";
import { deleteTopic, updateTopic } from "@/lib/services/subject.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ topicId: string }> };

/** PATCH /api/topics/:topicId — teacher who owns the subject. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { topicId } = await params;
    const actor = await requireActor();
    const input = await parseJsonBody(request, updateTopicSchema);
    return ok({ topic: await updateTopic(actor, topicId, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/topics/:topicId — teacher who owns the subject. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { topicId } = await params;
    const actor = await requireActor();
    return ok(await deleteTopic(actor, topicId));
  } catch (error) {
    return handleApiError(error);
  }
}
