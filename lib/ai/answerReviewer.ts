import {
  aiAnswerReviewSchema,
  AiError,
  type ReviewAnswerRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";

const SYSTEM_INSTRUCTION = `You mark a single school answer.
Return ONLY JSON: {"isCorrect":boolean,"confidence":number,"reason":string}
Judge meaning, not spelling or word order. Be strict about factual content.`;

export interface AnswerReview {
  isCorrect: boolean;
  reviewedBy: "exact-match" | "gemini";
  reason?: string;
}

/** Case- and whitespace-insensitive comparison used for objective questions. */
function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function exactMatch(studentAnswer: string, correctAnswer: string) {
  return normalise(studentAnswer) === normalise(correctAnswer);
}

/**
 * Marks one answer.
 *
 * Multiple choice and true/false answers are compared directly — there is no
 * reasoning to do, so no Gemini call is made and no quota is spent. Only free
 * text that does not match exactly is sent to the model, and even then a
 * failure degrades to the exact-match verdict rather than an error.
 */
export async function reviewAnswer(
  request: ReviewAnswerRequest,
): Promise<AnswerReview> {
  const matches = exactMatch(request.studentAnswer, request.correctAnswer);

  if (request.questionType !== "SHORT_ANSWER" || matches) {
    return { isCorrect: matches, reviewedBy: "exact-match" };
  }

  if (getProvider() === "mock") {
    return { isCorrect: matches, reviewedBy: "exact-match" };
  }

  try {
    const review = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: [
          `Question: ${request.question}`,
          `Expected answer: ${request.correctAnswer}`,
          `Student answer: ${request.studentAnswer}`,
        ].join("\n"),
        temperature: 0,
      },
      aiAnswerReviewSchema,
    );

    return {
      isCorrect: review.isCorrect,
      reviewedBy: "gemini",
      reason: review.reason,
    };
  } catch (error) {
    const reason = error instanceof AiError ? error.kind : "UPSTREAM_ERROR";
    console.error("[ai] answer review fell back to exact match:", reason);
    return { isCorrect: matches, reviewedBy: "exact-match" };
  }
}
