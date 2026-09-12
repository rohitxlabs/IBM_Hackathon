/**
 * Exercises the AI layer directly, without consuming quota unless asked.
 *
 *   npm run test:ai              mock provider plus every failure path
 *   AI_PROVIDER=gemini npm run test:ai   also makes one real Gemini call
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env"), quiet: true });
loadEnv({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
  quiet: true,
});

import { check, section, summary } from "./lib/api-client";
import { generateQuestions } from "../lib/ai/questionGenerator";
import { generateExplanation } from "../lib/ai/explanationGenerator";
import { reviewAnswer, exactMatch } from "../lib/ai/answerReviewer";
import { getProvider, isGeminiConfigured } from "../lib/ai/gemini";
import { AiError } from "../lib/ai/types";

const baseRequest = {
  subjectName: "Mathematics",
  topicNames: ["Quadratic Equations"],
  weakTopicNames: ["Quadratic Equations"],
  previousMistakes: [
    { question: "Solve x^2 = 16.", correctAnswer: "x = 4 or x = -4" },
  ],
  difficulty: "MEDIUM" as const,
  questionType: "MCQ" as const,
  count: 3,
  gradeLevel: 9,
};

async function main() {
  section("1. Provider selection");
  check(
    "AI_PROVIDER selects the provider",
    ["mock", "gemini"].includes(getProvider()),
    getProvider(),
  );
  console.log(
    `  info  provider=${getProvider()} geminiKeyPresent=${isGeminiConfigured()}`,
  );

  section("2. Question generation");
  const generated = await generateQuestions(baseRequest);
  check("questions are generated", generated.questions.length === 3);
  check(
    "every MCQ answer is one of its options",
    generated.questions.every((q) =>
      q.options?.some(
        (o) => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
      ),
    ),
  );
  check(
    "the provider is reported",
    ["mock", "gemini"].includes(generated.generatedBy),
    generated.generatedBy,
  );
  check(
    "weak topics steer the generated questions",
    generated.questions.some((q) => q.prompt.includes("Quadratic Equations")) ||
      generated.generatedBy === "gemini",
  );

  section("3. Answer review avoids needless AI calls");
  const mcq = await reviewAnswer({
    question: "Pick the right root.",
    studentAnswer: "x = 2",
    correctAnswer: "x = 2",
    questionType: "MCQ",
  });
  check("a correct MCQ is marked without AI", mcq.isCorrect && mcq.reviewedBy === "exact-match");

  const wrongMcq = await reviewAnswer({
    question: "Pick the right root.",
    studentAnswer: "x = 9",
    correctAnswer: "x = 2",
    questionType: "MCQ",
  });
  check(
    "a wrong MCQ is marked without AI",
    !wrongMcq.isCorrect && wrongMcq.reviewedBy === "exact-match",
  );

  const trueFalse = await reviewAnswer({
    question: "True or false?",
    studentAnswer: "true",
    correctAnswer: "True",
    questionType: "TRUE_FALSE",
  });
  check(
    "true/false comparison ignores case",
    trueFalse.isCorrect && trueFalse.reviewedBy === "exact-match",
  );

  const exactShort = await reviewAnswer({
    question: "Name the formula.",
    studentAnswer: "  Quadratic   Formula ",
    correctAnswer: "quadratic formula",
    questionType: "SHORT_ANSWER",
  });
  check(
    "an exactly matching short answer skips the AI",
    exactShort.isCorrect && exactShort.reviewedBy === "exact-match",
  );
  check("exactMatch normalises whitespace and case", exactMatch("A  b", "a b"));

  section("4. Explanations");
  const explanation = await generateExplanation({
    subjectName: "Mathematics",
    topicName: "Quadratic Equations",
    question: "Solve x^2 = 16.",
    studentAnswer: "x = 4",
    correctAnswer: "x = 4 or x = -4",
  });
  check("explanation says what went wrong", explanation.whatWentWrong.length > 5);
  check("explanation states the correct concept", explanation.correctConcept.length > 5);
  check("explanation gives reasoning", explanation.explanation.length > 15);
  check("explanation carries a learning tip", Boolean(explanation.learningTip));

  section("5. Failure handling");
  const savedProvider = process.env.AI_PROVIDER;
  const savedKey = process.env.GEMINI_API_KEY;

  // Gemini selected but no key at all.
  process.env.AI_PROVIDER = "gemini";
  delete process.env.GEMINI_API_KEY;

  const noKey = await generateQuestions(baseRequest);
  check(
    "a missing API key falls back to mock questions instead of failing",
    noKey.questions.length === 3 && noKey.generatedBy === "mock",
  );
  check(
    "the fallback reason is reported",
    noKey.fallbackReason === "NOT_CONFIGURED",
    noKey.fallbackReason,
  );

  const noKeyExplanation = await generateExplanation({
    subjectName: "Mathematics",
    question: "Solve x^2 = 16.",
    studentAnswer: "x = 4",
    correctAnswer: "x = 4 or x = -4",
  });
  check(
    "explanations fall back too",
    noKeyExplanation.generatedBy === "mock" &&
      noKeyExplanation.fallbackReason === "NOT_CONFIGURED",
  );

  const noKeyReview = await reviewAnswer({
    question: "Name the formula.",
    studentAnswer: "the quadratic one",
    correctAnswer: "quadratic formula",
    questionType: "SHORT_ANSWER",
  });
  check(
    "answer review degrades to exact match on AI failure",
    noKeyReview.reviewedBy === "exact-match" && noKeyReview.isCorrect === false,
  );

  // An invalid key exercises the upstream error path.
  process.env.GEMINI_API_KEY = "invalid-key-for-testing";
  const badKey = await generateQuestions({ ...baseRequest, count: 2 });
  check(
    "an invalid key still returns usable questions",
    badKey.questions.length === 2 && badKey.generatedBy === "mock",
  );
  check(
    "the upstream failure is classified",
    ["UPSTREAM_ERROR", "QUOTA_EXCEEDED", "RATE_LIMITED", "TIMEOUT"].includes(
      badKey.fallbackReason ?? "",
    ),
    badKey.fallbackReason,
  );

  check(
    "AiError classifies retryable failures",
    new AiError("RATE_LIMITED", "x").retryable &&
      !new AiError("NOT_CONFIGURED", "x").retryable,
  );

  if (savedProvider) process.env.AI_PROVIDER = savedProvider;
  else delete process.env.AI_PROVIDER;
  if (savedKey) process.env.GEMINI_API_KEY = savedKey;

  section("6. Key handling");
  check(
    "no NEXT_PUBLIC_GEMINI_API_KEY is defined",
    process.env.NEXT_PUBLIC_GEMINI_API_KEY === undefined,
  );
  check(
    "the key is never embedded in generated content",
    !JSON.stringify(generated).includes(savedKey ?? "unset-key"),
  );

  summary("AI layer");
}

main().catch((error) => {
  console.error("AI test run crashed:", error);
  process.exitCode = 1;
});
