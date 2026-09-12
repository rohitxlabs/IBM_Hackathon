export interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswer: string | null;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  answers: (QuizAnswer & { isCorrect: boolean })[];
}

export type QuizState = 
  | { status: 'idle' }
  | { status: 'generating'; topic: string }
  | { status: 'error'; error: string; topic?: string }
  | { status: 'quiz'; quiz: Quiz; currentQuestion: number; answers: QuizAnswer[] }
  | { status: 'results'; result: QuizResult; quiz: Quiz };
