import type { ZodType } from "zod";
import { AiError } from "@/lib/ai/types";

/**
 * Thin Gemini transport.
 *
 * GEMINI_API_KEY is read only here, only on the server. It is never sent to
 * the browser and never appears in an API response — the key must not be
 * exposed through a NEXT_PUBLIC_ variable.
 */

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 20_000;

export type AiProvider = "gemini" | "mock";

export function getProvider(): AiProvider {
  if (process.env.AI_PROVIDER === "mock") return "mock";
  if (process.env.GEMINI_API_KEY || process.env.AI_PROVIDER === "gemini") return "gemini";
  return "mock";
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GeminiCallOptions {
  systemInstruction: string;
  prompt: string;
  /** Hint for the model; the response is validated regardless. */
  responseSchemaHint?: string;
  timeoutMs?: number;
  temperature?: number;
}

/** Sends one request to Gemini and returns the raw text of the first candidate. */
async function callGemini(options: GeminiCallOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AiError("NOT_CONFIGURED", "GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // Header auth keeps the key out of URLs and any request logs.
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: options.systemInstruction }],
          },
          contents: [{ role: "user", parts: [{ text: options.prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.4,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new AiError("TIMEOUT", "The AI request timed out", error);
    }
    throw new AiError("UPSTREAM_ERROR", "Could not reach the AI service", error);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");

    if (response.status === 429) {
      throw new AiError("RATE_LIMITED", "The AI service is rate limiting us");
    }

    if (response.status === 403 || /quota/i.test(bodyText)) {
      throw new AiError(
        "QUOTA_EXCEEDED",
        "The AI quota has been exhausted or the key is not authorized",
      );
    }

    throw new AiError(
      "UPSTREAM_ERROR",
      `The AI service returned ${response.status}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    | null;

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new AiError("INVALID_RESPONSE", "The AI returned an empty response");
  }

  return text;
}

/** Strips markdown fences the model sometimes adds around JSON. */
function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to the outermost object or array in the response.
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (!match) {
      throw new AiError("INVALID_RESPONSE", "The AI did not return JSON");
    }
    try {
      return JSON.parse(match[0]);
    } catch (error) {
      throw new AiError(
        "INVALID_RESPONSE",
        "The AI returned malformed JSON",
        error,
      );
    }
  }
}

/**
 * Calls Gemini and validates the reply against a Zod schema. One retry is
 * allowed when the model returns something unparseable.
 */
export async function callGeminiJson<T>(
  options: GeminiCallOptions,
  schema: ZodType<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const text = await callGemini(options);

    try {
      const parsed = schema.safeParse(extractJson(text));
      if (parsed.success) return parsed.data;
      lastError = new AiError(
        "INVALID_RESPONSE",
        "The AI response did not match the expected shape",
        parsed.error.issues,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof AiError
    ? lastError
    : new AiError("INVALID_RESPONSE", "The AI response could not be used");
}
