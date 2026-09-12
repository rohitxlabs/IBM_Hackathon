import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/lib/services/auth.service";
import { createSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

/** POST /api/auth/register — creates a user plus its role profile. */
export async function POST(request: NextRequest) {
  try {
    const input = await parseJsonBody(request, registerSchema);
    const user = await registerUser(input);

    await createSessionCookie({ userId: user.id, role: input.role });

    return ok({ user }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
