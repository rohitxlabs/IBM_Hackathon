'use client';

import { Question } from '@/lib/types';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuizQuestionProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={index}
              onClick={() => onSelectAnswer(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-gray-900 dark:text-white">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
