import { z } from "zod";

/**
 * Zod schemas for everything the AI provider returns. Model output is never
 * trusted: it is parsed and validated before it reaches the database.
 */

export const aiQuestionSchema = z.object({
  prompt: z.string().min(5).max(2000),
  questionType: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string().min(1).max(500)).max(6).optional(),
  correctAnswer: z.string().min(1).max(500),
  explanation: z.string().max(2000).optional(),
  topicName: z.string().max(200).optional(),
});

export type AiQuestion = z.infer<typeof aiQuestionSchema>;

export const aiQuestionListSchema = z
  .object({ questions: z.array(aiQuestionSchema).min(1).max(25) })
  .transform((v) => v.questions);

export const aiExplanationSchema = z.object({
  whatWentWrong: z.string().min(3).max(1500),
  correctConcept: z.string().min(3).max(1500),
  explanation: z.string().min(3).max(2500),
  learningTip: z.string().max(800).optional(),
});

export type AiExplanation = z.infer<typeof aiExplanationSchema>;

export const aiAnswerReviewSchema = z.object({
  isCorrect: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
  reason: z.string().max(1000).optional(),
});

export type AiAnswerReview = z.infer<typeof aiAnswerReviewSchema>;

/* ------------------------------ AI failures ------------------------------ */

export type AiFailureKind =
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "UPSTREAM_ERROR";

/**
 * Raised by the AI layer. Callers decide whether to fall back to a
 * deterministic local result or surface the problem — the app never crashes
 * because the model was unavailable.
 */
export class AiError extends Error {
  constructor(
    readonly kind: AiFailureKind,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiError";
  }

  /** Whether a later retry is likely to succeed. */
  get retryable(): boolean {
    return (
      this.kind === "RATE_LIMITED" ||
      this.kind === "TIMEOUT" ||
      this.kind === "UPSTREAM_ERROR"
    );
  }
}

export interface GenerateQuestionsRequest {
  subjectName: string;
  topicNames: string[];
  weakTopicNames: string[];
  previousMistakes: { question: string; correctAnswer: string }[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  count: number;
  gradeLevel?: number;
}

export interface ExplainRequest {
  subjectName: string;
  topicName?: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}

export interface ReviewAnswerRequest {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
}

/* ------------------------- lesson-based quiz generation ------------------ */

/**
 * A concept-tagged question generated from a teacher's lesson material. Every
 * question must carry a concept tag: that is what lets Jinni say exactly
 * which idea a student has or has not grasped, not just a total score.
 */
export const aiLessonQuestionSchema = z.object({
  prompt: z.string().min(5).max(2000),
  options: z.array(z.string().min(1).max(500)).length(4),
  correctAnswer: z.string().min(1).max(500),
  explanation: z.string().min(3).max(2000),
  conceptTag: z.string().min(2).max(120),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export type AiLessonQuestion = z.infer<typeof aiLessonQuestionSchema>;

export const aiLessonQuizSchema = z
  .object({ questions: z.array(aiLessonQuestionSchema).min(1).max(20) })
  .transform((v) => v.questions);

export interface GenerateLessonQuizRequest {
  subjectName: string;
  topicName: string;
  gradeLevel: number;
  /** The teacher's lesson notes or material the questions must be grounded in. */
  material: string;
  count: number;
}

/* -------------------------- attempt analysis ------------------------------ */

/**
 * Jinni's written verdict on one quiz attempt. Concept tags in `strongAreas`
 * and `weakAreas` must be a subset of the concepts actually tested — the
 * model is not allowed to invent a topic the student was never asked about.
 */
export const aiAttemptAnalysisSchema = z.object({
  summary: z.string().min(10).max(1000),
  strongAreas: z.array(z.string().min(1).max(120)).max(20),
  weakAreas: z.array(z.string().min(1).max(120)).max(20),
  misconceptions: z.string().min(10).max(2000),
  recommendations: z.array(z.string().min(3).max(400)).min(1).max(8),
});

export type AiAttemptAnalysis = z.infer<typeof aiAttemptAnalysisSchema>;

export interface ConceptResult {
  conceptTag: string;
  correct: number;
  total: number;
  accuracy: number;
  level: "WEAK" | "AVERAGE" | "STRONG";
}

export interface AnalyzeAttemptRequest {
  subjectName: string;
  topicName?: string;
  gradeLevel: number;
  scorePercentage: number;
  conceptResults: ConceptResult[];
  incorrectAnswers: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    conceptTag: string;
  }[];
}

export interface AdaptiveQuizRequest {
  subjectName: string;
  topicName: string;
  gradeLevel: number;
  /** Concepts to focus most questions on, weakest first. */
  weakConcepts: string[];
  /** A smaller number of review questions from concepts already mastered. */
  reviewConcepts: string[];
  /**
   * EASY when the student is still struggling on a prior follow-up, HARD when
   * they have been improving — this is what makes difficulty adapt over time
   * rather than staying fixed at the original quiz's level.
   */
  difficulty: "EASY" | "MEDIUM" | "HARD";
  count: number;
}
