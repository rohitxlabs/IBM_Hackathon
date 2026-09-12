// Thin fetch wrapper for talking to the backend's Route Handlers
// (app/api/**). Backend owns those routes; this file only knows how to
// call them and unwrap the { success, data } / { success: false, error }
// envelope defined in lib/api/response.ts.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; error: ApiErrorPayload };

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      credentials: "include",
    });
  } catch {
    throw new ApiRequestError(
      "NETWORK_ERROR",
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  let body: Envelope<T> | undefined;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (e.g. the route doesn't exist yet).
  }

  if (!body) {
    throw new ApiRequestError(
      "INVALID_RESPONSE",
      "The server returned an unexpected response.",
      response.status,
    );
  }

  if (!body.success) {
    throw new ApiRequestError(
      body.error.code,
      body.error.message,
      response.status,
      body.error.details,
    );
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, payload?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    }),
  patch: <T>(path: string, payload?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
