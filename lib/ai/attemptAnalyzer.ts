import {
  aiAttemptAnalysisSchema,
  AiError,
  type AiAttemptAnalysis,
  type AnalyzeAttemptRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockAttemptAnalysis } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You are Jinni, an encouraging AI learning coach writing feedback for a school student after a quiz.
Return ONLY JSON:
{"summary":string,"strongAreas":string[],"weakAreas":string[],"misconceptions":string,"recommendations":string[]}
Rules:
- strongAreas and weakAreas must only use concept names from the list provided — never invent a concept the student was not tested on.
- Base strongAreas/weakAreas on the given per-concept accuracy, not on the overall score alone. A high overall score can still hide a weak concept.
- Write for the student directly, in a warm, encouraging tone appropriate for their grade level. Never say "you failed" or use judgmental language — frame gaps as the next thing to work on, not a shortcoming.
- misconceptions should explain, in plain language, what likely caused the wrong answers, based on the incorrect answers given.
- recommendations should be concrete, actionable next steps (e.g. "practise three more problems on the discriminant"), not vague encouragement alone.`;

function buildPrompt(request: AnalyzeAttemptRequest): string {
  const lines = [
    `Subject: ${request.subjectName}`,
    request.topicName ? `Topic: ${request.topicName}` : null,
    `Grade level: ${request.gradeLevel}`,
    `Overall score: ${request.scorePercentage}%`,
    "",
    "Per-concept accuracy:",
    ...request.conceptResults.map(
      (c) =>
        `- ${c.conceptTag}: ${c.correct}/${c.total} correct (${c.accuracy}%, banded ${c.level})`,
    ),
  ].filter(Boolean);

  if (request.incorrectAnswers.length > 0) {
    lines.push(
      "",
      "Incorrect answers:",
      ...request.incorrectAnswers.map(
        (a, i) =>
          `${i + 1}. [${a.conceptTag}] Q: ${a.question} | Student answered: ${a.studentAnswer} | Correct: ${a.correctAnswer}`,
      ),
    );
  }

  return lines.join("\n");
}

export interface GeneratedAttemptAnalysis extends AiAttemptAnalysis {
  generatedBy: "gemini" | "mock";
  fallbackReason?: string;
}

/**
 * Turns per-concept accuracy and the specific wrong answers into a written
 * analysis a student can act on. This is what distinguishes Jinni from a
 * plain scorer: a 7/10 with one weak concept reads very differently from a
 * 7/10 across the board, and the analysis says which one happened.
 *
 * A Gemini failure falls back to a deterministic summary built from the same
 * concept data, so the student always receives feedback.
 */
export async function analyzeAttempt(
  request: AnalyzeAttemptRequest,
): Promise<GeneratedAttemptAnalysis> {
  if (getProvider() === "mock") {
    return { ...mockAttemptAnalysis(request), generatedBy: "mock" };
  }

  try {
    const analysis = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: buildPrompt(request),
        temperature: 0.4,
      },
      aiAttemptAnalysisSchema,
    );

    // The model must stay within the concepts it was actually given —
    // strip anything it invented rather than trust it blindly.
    const knownConcepts = new Set(
      request.conceptResults.map((c) => c.conceptTag),
    );

    return {
      ...analysis,
      strongAreas: analysis.strongAreas.filter((c) => knownConcepts.has(c)),
      weakAreas: analysis.weakAreas.filter((c) => knownConcepts.has(c)),
      generatedBy: "gemini",
    };
  } catch (error) {
    const reason = error instanceof AiError ? error.kind : "UPSTREAM_ERROR";
    console.error("[ai] attempt analysis fell back to mock:", reason);

    return {
      ...mockAttemptAnalysis(request),
      generatedBy: "mock",
      fallbackReason: reason,
    };
  }
}
