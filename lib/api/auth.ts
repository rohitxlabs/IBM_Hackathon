// Frontend API client for authentication. Calls the backend's
// /api/auth/** Route Handlers — this file must not implement auth logic
// itself (no password hashing, no session/JWT handling). Those endpoints
// don't exist yet on the backend; calls here will fail with NOT_FOUND
// until the backend developer adds them, which is expected during
// parallel development.

import { api } from "./client";

// Matches the backend's Prisma `Role` enum values.
export type AuthRole = "STUDENT" | "TEACHER" | "PARENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: AuthRole;
}

export function login(payload: LoginPayload) {
  return api.post<AuthUser>("/api/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return api.post<AuthUser>("/api/auth/register", payload);
}

export function logout() {
  return api.post<null>("/api/auth/logout");
}

export function getSession() {
  return api.get<AuthUser>("/api/auth/session");
}
