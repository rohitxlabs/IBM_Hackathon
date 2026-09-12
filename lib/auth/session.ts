import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/generated/prisma/enums";

export const SESSION_COOKIE = "jinni_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ISSUER = "jinni";

export interface SessionPayload {
  userId: string;
  role: Role;
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short (need at least 32 characters)",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: ISSUER,
    });

    if (!payload.sub || typeof payload.role !== "string") return null;

    return { userId: payload.sub, role: payload.role as Role };
  } catch {
    // Expired, tampered with, or signed by a different secret.
    return null;
  }
}

/** Writes the signed session cookie. Never readable from client JavaScript. */
export async function createSessionCookie(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
