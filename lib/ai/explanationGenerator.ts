import {
  aiExplanationSchema,
  AiError,
  type AiExplanation,
  type ExplainRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockExplanation } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You explain a school student's wrong answer.
Return ONLY JSON:
{"whatWentWrong":string,"correctConcept":string,"explanation":string,"learningTip":string}
Be encouraging, concrete and brief. Explain the reasoning, do not just restate the answer.`;

export interface GeneratedExplanation extends AiExplanation {
  generatedBy: "gemini" | "mock";
  fallbackReason?: string;
}

/**
 * Explains why an answer was wrong. A Gemini failure falls back to a
 * deterministic explanation so the student always gets something back.
 */
export async function generateExplanation(
  request: ExplainRequest,
): Promise<GeneratedExplanation> {
  if (getProvider() === "mock") {
    return { ...mockExplanation(request), generatedBy: "mock" };
  }

  try {
    const explanation = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: [
          `Subject: ${request.subjectName}`,
          request.topicName ? `Topic: ${request.topicName}` : null,
          `Question: ${request.question}`,
          `Student answer: ${request.studentAnswer}`,
          `Correct answer: ${request.correctAnswer}`,
        ]
          .filter(Boolean)
          .join("\n"),
        temperature: 0.3,
      },
      aiExplanationSchema,
    );

    return { ...explanation, generatedBy: "gemini" };
  } catch (error) {
    const reason = error instanceof AiError ? error.kind : "UPSTREAM_ERROR";
    console.error("[ai] explanation fell back to mock:", reason);
    return {
      ...mockExplanation(request),
      generatedBy: "mock",
      fallbackReason: reason,
    };
  }
}

/** Compact single-line form stored on a practice question or mistake row. */
export function flattenExplanation(explanation: AiExplanation): string {
  return [
    explanation.whatWentWrong,
    explanation.correctConcept,
    explanation.explanation,
    explanation.learningTip,
  ]
    .filter(Boolean)
    .join(" ");
}
