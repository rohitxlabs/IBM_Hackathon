'use client';

import { Question, QuizAnswer } from '@/lib/types';

interface QuizNavigationProps {
  questions: Question[];
  answers: QuizAnswer[];
  currentIndex: number;
  onGoToQuestion: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function QuizNavigation({
  questions,
  answers,
  currentIndex,
  onGoToQuestion,
  onPrevious,
  onNext,
  onSubmit,
}: QuizNavigationProps) {
  const answeredCount = answers.filter((a) => a.selectedAnswer !== null).length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {questions.map((_, index) => {
          const answer = answers[index];
          const isAnswered = answer?.selectedAnswer !== null;
          const isCurrent = index === currentIndex;

          return (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                isCurrent
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                  : isAnswered
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {answeredCount} of {questions.length} answered
        </span>

        {isLastQuestion && allAnswered ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isLastQuestion}
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
