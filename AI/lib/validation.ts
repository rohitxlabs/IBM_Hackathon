import { Question } from './types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateGeminiResponse(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid response format' };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.questions || !Array.isArray(obj.questions)) {
    return { isValid: false, error: 'Missing questions array' };
  }

  if (obj.questions.length !== 10) {
    return { isValid: false, error: `Expected 10 questions, got ${obj.questions.length}` };
  }

  for (let i = 0; i < obj.questions.length; i++) {
    const q = obj.questions[i] as Record<string, unknown>;
    const questionNum = i + 1;

    if (!q.id || typeof q.id !== 'number') {
      return { isValid: false, error: `Question ${questionNum}: missing or invalid id` };
    }

    if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
      return { isValid: false, error: `Question ${questionNum}: missing or empty question text` };
    }

    if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
      return { isValid: false, error: `Question ${questionNum}: must have exactly 4 options` };
    }

    for (let j = 0; j < q.options.length; j++) {
      if (typeof q.options[j] !== 'string' || (q.options[j] as string).trim() === '') {
        return { isValid: false, error: `Question ${questionNum}: option ${j + 1} is empty` };
      }
    }

    if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || q.correctAnswer.trim() === '') {
      return { isValid: false, error: `Question ${questionNum}: missing correctAnswer` };
    }

    if (!q.options.includes(q.correctAnswer as string)) {
      return { isValid: false, error: `Question ${questionNum}: correctAnswer does not match any option` };
    }

    if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim() === '') {
      return { isValid: false, error: `Question ${questionNum}: missing explanation` };
    }
  }

  return { isValid: true };
}

export function sanitizeQuestions(data: unknown): Question[] {
  const obj = data as { questions: unknown[] };
  return obj.questions.map((q: unknown, index: number) => {
    const question = q as Record<string, unknown>;
    return {
      id: index + 1,
      question: (question.question as string).trim(),
      options: [
        (question.options as string[])[0].trim(),
        (question.options as string[])[1].trim(),
        (question.options as string[])[2].trim(),
        (question.options as string[])[3].trim(),
      ] as [string, string, string, string],
      correctAnswer: (question.correctAnswer as string).trim(),
      explanation: (question.explanation as string).trim(),
    };
  });
}
