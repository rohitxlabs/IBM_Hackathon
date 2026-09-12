/** Tiny HTTP helper with a per-user cookie jar, used by the API test scripts. */

export const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

export interface ApiResult<T = unknown> {
  status: number;
  body: T;
}

export class Client {
  private cookie = "";

  constructor(readonly label: string) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(this.cookie ? { cookie: this.cookie } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      redirect: "manual",
    });

    const setCookie = response.headers.getSetCookie?.() ?? [];
    for (const raw of setCookie) {
      const [pair] = raw.split(";");
      if (pair.startsWith("jinni_session=")) {
        this.cookie = pair;
      }
    }

    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      /* keep the raw text for debugging */
    }

    return { status: response.status, body: parsed as T };
  }

  get<T = any>(path: string) {
    return this.request<T>("GET", path);
  }
  post<T = any>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }
  patch<T = any>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, body);
  }
  delete<T = any>(path: string) {
    return this.request<T>("DELETE", path);
  }

  clearCookie() {
    this.cookie = "";
  }

  hasCookie() {
    return this.cookie.length > 0;
  }
}

/* ------------------------------ assertions ------------------------------ */

let passed = 0;
let failed = 0;
const failures: string[] = [];

export function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

export function checkStatus(
  name: string,
  result: ApiResult,
  expected: number,
) {
  check(
    name,
    result.status === expected,
    `expected ${expected}, got ${result.status}: ${JSON.stringify(
      result.body,
    ).slice(0, 240)}`,
  );
}

export function section(title: string) {
  console.log(`\n${title}`);
}

export function summary(label: string) {
  console.log(
    `\n${label}: ${passed} passed, ${failed} failed` +
      (failures.length ? `\nFailed: ${failures.join(", ")}` : ""),
  );
  process.exitCode = failed === 0 ? 0 : 1;
  return failed === 0;
}

export function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}
