/**
 * Frontend API client for authentication.
 *
 * Calls the backend's /api/auth/** Route Handlers and nothing more: no
 * password hashing, no token handling, no session storage. The session lives
 * in an httpOnly cookie the browser sends automatically, which is why no
 * token is ever read or written here.
 */

import { api } from "./client";
import type { Role, User } from "./types";

export type AuthRole = Role;
export type AuthUser = User;

export interface LoginPayload {
  email: string;
  password: string;
}

interface BaseRegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Registration is role-discriminated: the backend requires different profile
 * fields per role, so the form collects exactly those and no others.
 */
export type RegisterPayload =
  | (BaseRegisterPayload & {
      role: "STUDENT";
      rollNumber: string;
      gradeLevel: number;
      dateOfBirth?: string;
    })
  | (BaseRegisterPayload & {
      role: "TEACHER";
      employeeId: string;
      department?: string;
      bio?: string;
    })
  | (BaseRegisterPayload & {
      role: "PARENT";
      phone?: string;
      occupation?: string;
    });

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { user } = await api.post<{ user: AuthUser }>(
    "/api/auth/login",
    payload,
  );
  return user;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { user } = await api.post<{ user: AuthUser }>(
    "/api/auth/register",
    payload,
  );
  return user;
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return api.post<{ loggedOut: boolean }>("/api/auth/logout");
}

/** The signed-in user, or a 401 that callers treat as "signed out". */
export async function getCurrentUser(): Promise<AuthUser> {
  const { user } = await api.get<{ user: AuthUser }>("/api/auth/me");
  return user;
}

/** Landing route for a role, used after signing in. */
export function homePathForRole(role: Role): string {
  return `/${role.toLowerCase()}`;
}
