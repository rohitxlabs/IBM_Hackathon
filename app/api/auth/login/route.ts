import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { loginSchema } from "@/lib/validation/auth";
import { authenticateUser } from "@/lib/services/auth.service";
import { createSessionCookie } from "@/lib/auth/session";
import type { Role } from "@/lib/generated/prisma/enums";

export const runtime = "nodejs";

/** POST /api/auth/login — verifies credentials and issues a session cookie. */
export async function POST(request: NextRequest) {
  try {
    const input = await parseJsonBody(request, loginSchema);
    const { userId, ...user } = await authenticateUser(input);

    await createSessionCookie({ userId, role: user.role as Role });

    return ok({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
