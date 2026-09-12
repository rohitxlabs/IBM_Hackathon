import {
  aiQuestionListSchema,
  AiError,
  type AiQuestion,
  type GenerateQuestionsRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockQuestions } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You are an exam question writer for school students.
Return ONLY JSON of the form:
{"questions":[{"prompt":string,"questionType":"MCQ"|"TRUE_FALSE"|"SHORT_ANSWER","options":string[],"correctAnswer":string,"explanation":string,"topicName":string}]}
Rules:
- correctAnswer must be exactly one of options for MCQ and TRUE_FALSE.
- Provide exactly four options for MCQ and ["True","False"] for TRUE_FALSE.
- Omit options for SHORT_ANSWER.
- Keep each question self-contained and free of images or external references.`;

function buildPrompt(request: GenerateQuestionsRequest): string {
  const lines = [
    `Subject: ${request.subjectName}`,
    request.gradeLevel ? `Grade level: ${request.gradeLevel}` : null,
    request.topicNames.length
      ? `Topics: ${request.topicNames.join(", ")}`
      : null,
    request.weakTopicNames.length
      ? `Prioritise these weak topics: ${request.weakTopicNames.join(", ")}`
      : null,
    `Difficulty: ${request.difficulty}`,
    `Question type: ${request.questionType}`,
    `Number of questions: ${request.count}`,
  ].filter(Boolean);

  if (request.previousMistakes.length) {
    lines.push(
      "Target the misconceptions behind these past mistakes:",
      ...request.previousMistakes
        .slice(0, 8)
        .map(
          (m, i) =>
            `${i + 1}. Question: ${m.question} | Correct answer: ${m.correctAnswer}`,
        ),
    );
  }

  return lines.join("\n");
}

export interface GeneratedQuestions {
  questions: AiQuestion[];
  generatedBy: "gemini" | "mock";
  /** Set when Gemini was requested but the call failed and mock data was used. */
  fallbackReason?: string;
}

/**
 * Generates practice questions. When the provider is Gemini and the call
 * fails for any reason, deterministic mock questions are returned instead so
 * the student still gets a usable test.
 */
export async function generateQuestions(
  request: GenerateQuestionsRequest,
): Promise<GeneratedQuestions> {
  if (getProvider() === "mock") {
    return { questions: mockQuestions(request), generatedBy: "mock" };
  }

  try {
    const questions = await callGeminiJson(
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: buildPrompt(request),
        temperature: 0.7,
      },
      aiQuestionListSchema,
    );

    const usable = questions
      .filter((q) => isConsistent(q))
      .slice(0, request.count);

    if (usable.length === 0) {
      throw new AiError(
        "INVALID_RESPONSE",
        "The AI returned no usable questions",
      );
    }

    return { questions: usable, generatedBy: "gemini" };
  } catch (error) {
    const reason =
      error instanceof AiError ? error.kind : "UPSTREAM_ERROR";
    console.error("[ai] question generation fell back to mock:", reason);

    return {
      questions: mockQuestions(request),
      generatedBy: "mock",
      fallbackReason: reason,
    };
  }
}

/** A choice question is only usable if its answer is among the options. */
function isConsistent(question: AiQuestion): boolean {
  if (question.questionType === "SHORT_ANSWER") return true;

  return Boolean(
    question.options?.some(
      (option) =>
        option.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase(),
    ),
  );
}
