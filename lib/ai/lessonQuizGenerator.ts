import {
  aiLessonQuizSchema,
  AiError,
  type AiLessonQuestion,
  type GenerateLessonQuizRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockLessonQuiz } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You are an expert teacher writing a quiz from a lesson.
Return ONLY JSON of the form:
{"questions":[{"prompt":string,"options":string[4],"correctAnswer":string,"explanation":string,"conceptTag":string,"difficulty":"EASY"|"MEDIUM"|"HARD"}]}
Rules:
- Base every question strictly on the supplied lesson material — do not introduce outside facts.
- Every question must have exactly four options, and correctAnswer must match one of them exactly.
- conceptTag names the specific sub-idea the question tests (e.g. "Completing the Square", not just the topic name). Reuse the same conceptTag string for questions that test the same idea, so results can be grouped by concept later.
- Spread difficulty across the quiz: roughly a third easy, a third medium, a third hard.
- Keep language appropriate for the stated grade level.`;

function buildPrompt(request: GenerateLessonQuizRequest): string {
  return [
    `Subject: ${request.subjectName}`,
    `Topic: ${request.topicName}`,
    `Grade level: ${request.gradeLevel}`,
    `Number of questions: ${request.count}`,
    "Lesson material:",
    request.material,
  ].join("\n");
}

export interface GeneratedLessonQuiz {
  questions: AiLessonQuestion[];
  generatedBy: "gemini" | "mock";
  fallbackReason?: string;
}

/**
 * Generates a concept-tagged quiz from a teacher's lesson material. This is
 * the first step of the adaptive loop: every question must carry a concept
 * tag, since that is what later lets Jinni report accuracy per idea rather
 * than a single opaque score.
 *
 * A Gemini failure of any kind falls back to a deterministic mock quiz so the
 * teacher always has something to review rather than a dead end.
 */
export async function generateLessonQuiz(
  request: GenerateLessonQuizRequest,
): Promise<GeneratedLessonQuiz> {
  if (getProvider() === "mock") {
    return { questions: mockLessonQuiz(request), generatedBy: "mock" };
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
    console.error("[ai] lesson quiz generation fell back to mock:", reason);

    return {
      questions: mockLessonQuiz(request),
      generatedBy: "mock",
      fallbackReason: reason,
    };
  }
}

/**
 * Regenerates a single question, keeping it grounded in the same concept so
 * a teacher's "regenerate this one" click does not silently change what it
 * tests.
 */
export async function regenerateLessonQuestion(
  request: GenerateLessonQuizRequest,
  conceptTag: string,
): Promise<{ question: AiLessonQuestion; generatedBy: "gemini" | "mock" }> {
  const focused: GenerateLessonQuizRequest = { ...request, count: 1 };

  if (getProvider() === "mock") {
    return {
      question: { ...mockLessonQuiz(focused)[0], conceptTag },
      generatedBy: "mock",
    };
  }

  try {
    const questions = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: `${buildPrompt(focused)}\nWrite exactly one question, testing specifically the concept "${conceptTag}".`,
        temperature: 0.7,
      },
      aiLessonQuizSchema,
    );

    const question = questions.find(isWellFormed) ?? questions[0];

    if (!question) {
      throw new AiError("INVALID_RESPONSE", "The AI returned no question");
    }

    return { question, generatedBy: "gemini" };
  } catch (error) {
    console.error(
      "[ai] question regeneration fell back to mock:",
      error instanceof AiError ? error.kind : "UPSTREAM_ERROR",
    );
    return {
      question: { ...mockLessonQuiz(focused)[0], conceptTag },
      generatedBy: "mock",
    };
  }
}

function isWellFormed(question: AiLessonQuestion): boolean {
  return question.options.some(
    (option) =>
      option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase(),
  );
}
