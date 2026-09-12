import {
  aiLessonQuizSchema,
  AiError,
  type AiLessonQuestion,
  type GenerateTopicQuizRequest,
} from "@/lib/ai/types";
import { callGeminiJson, getProvider } from "@/lib/ai/gemini";
import { mockTopicQuiz } from "@/lib/ai/mock";

const SYSTEM_INSTRUCTION = `You are an expert teacher writing a multiple-choice quiz from a supplied topic.
Return ONLY JSON of the form:
{"questions":[{"prompt":string,"options":string[4],"correctAnswer":string,"explanation":string,"conceptTag":string,"difficulty":"EASY"|"MEDIUM"|"HARD"}]}
Rules:
- Exactly four options per question, with correctAnswer matching one option exactly.
- conceptTag names the specific sub-skill or idea being tested (not the whole topic).
  Reuse the same conceptTag for questions testing the same idea.
- Spread difficulty roughly evenly: 1/3 EASY, 1/3 MEDIUM, 1/3 HARD.
- Use language appropriate for the stated grade level and the overall requested difficulty.
- Base questions on common, standard-coverage content for the topic — do not invent niche facts.
- The explanation should teach the idea, not just state the answer.`;

function buildPrompt(request: GenerateTopicQuizRequest): string {
  return [
    `Subject: ${request.subjectName}`,
    `Topic: ${request.topic}`,
    `Overall difficulty: ${request.difficulty}`,
    `Grade level: ${request.gradeLevel}`,
    `Number of questions: ${request.count}`,
    "Write exactly the requested number of concept-tagged MCQ questions covering the topic broadly.",
  ].join("\n");
}

export interface GeneratedTopicQuiz {
  questions: AiLessonQuestion[];
  generatedBy: "gemini" | "mock";
  fallbackReason?: string;
}

/**
 * Generates a concept-tagged MCQ quiz from a free-text topic, without needing
 * a teacher's lesson material. Output schema is intentionally the same as
 * `generateLessonQuiz` so both flows share one PracticeTest data model.
 *
 * Falls back to a deterministic mock on any AI failure (missing key, timeout,
 * bad JSON, etc.) — the teacher must still approve, so a bad model output
 * never becomes visible to a student.
 */
export async function generateTopicQuiz(
  request: GenerateTopicQuizRequest,
): Promise<GeneratedTopicQuiz> {
  if (getProvider() === "mock") {
    return { questions: mockTopicQuiz(request), generatedBy: "mock" };
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
    console.error("[ai] topic quiz generation fell back to mock:", reason);

    return {
      questions: mockTopicQuiz(request),
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
