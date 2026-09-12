import {
  aiLessonQuizSchema,
  AiError,
  type AdaptiveQuizRequest,
  type AiLessonQuestion,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockAdaptiveQuiz } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You are Jinni, generating a personalised follow-up quiz targeting a student's weak concepts.
Return ONLY JSON of the form:
{"questions":[{"prompt":string,"options":string[4],"correctAnswer":string,"explanation":string,"conceptTag":string,"difficulty":"EASY"|"MEDIUM"|"HARD"}]}
Rules:
- Most questions (roughly 80%) must target the listed weak concepts, one at a time — do not blend two weak concepts into a single confusing question.
- A small number of questions (roughly 20%) should review concepts the student already understands, to build confidence and keep skills fresh.
- Every question must carry the exact conceptTag it targets, matching the concept names given, so progress on each one can be tracked across attempts.
- Set every question's difficulty to the level given — this quiz's difficulty has already been chosen based on how the student has been performing.
- Vary the phrasing and specific numbers/examples from any prior quiz on this topic — this is meant to be new practice, not a repeat.`;

function buildPrompt(request: AdaptiveQuizRequest): string {
  return [
    `Subject: ${request.subjectName}`,
    `Topic: ${request.topicName}`,
    `Grade level: ${request.gradeLevel}`,
    `Weak concepts to focus on: ${request.weakConcepts.join(", ")}`,
    request.reviewConcepts.length
      ? `Concepts to include a light review of: ${request.reviewConcepts.join(", ")}`
      : null,
    `Difficulty: ${request.difficulty}`,
    `Number of questions: ${request.count}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface GeneratedAdaptiveQuiz {
  questions: AiLessonQuestion[];
  generatedBy: "gemini" | "mock";
  fallbackReason?: string;
}

/**
 * Generates a follow-up quiz that concentrates on a student's weak concepts,
 * with a small amount of review from concepts they already know. This is the
 * step that closes the adaptive loop: without it, Jinni would only ever
 * report weaknesses rather than help fix them.
 *
 * Difficulty is passed in by the caller (see adaptiveDifficultyFor in
 * practice.service.ts), which ratchets it down after repeated struggle and
 * up after improvement — this module only has to honour whatever level it is
 * told to write at.
 */
export async function generateAdaptiveQuiz(
  request: AdaptiveQuizRequest,
): Promise<GeneratedAdaptiveQuiz> {
  if (getProvider() === "mock") {
    return { questions: mockAdaptiveQuiz(request), generatedBy: "mock" };
  }

  try {
    const questions = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: buildPrompt(request),
        temperature: 0.6,
      },
      aiLessonQuizSchema,
    );

    const usable = questions.filter(isWellFormed).slice(0, request.count);

    if (usable.length === 0) {
      throw new AiError(
        "INVALID_RESPONSE",
        "The AI returned no usable questions",
      );
    }

    return { questions: usable, generatedBy: "gemini" };
  } catch (error) {
    const reason = error instanceof AiError ? error.kind : "UPSTREAM_ERROR";
    console.error("[ai] adaptive quiz generation fell back to mock:", reason);

    return {
      questions: mockAdaptiveQuiz(request),
      generatedBy: "mock",
      fallbackReason: reason,
    };
  }
}

function isWellFormed(question: AiLessonQuestion): boolean {
  return question.options.some(
    (option) =>
      option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase(),
  );
}
