'use client';

import { Quiz, QuizResult } from '@/lib/types';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onTryAgain: () => void;
}

export function QuizResults({ quiz, result, onTryAgain }: QuizResultsProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 70) return 'Good work!';
    if (percentage >= 60) return 'Not bad!';
    return 'Keep practicing!';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Quiz Complete!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Topic: {quiz.topic}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8 shadow-lg">
        <div className={`text-5xl font-bold mb-2 ${getScoreColor(result.percentage)}`}>
          {result.percentage}%
        </div>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
          {getScoreMessage(result.percentage)}
        </p>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {result.correctAnswers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {result.incorrectAnswers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Question Review
      </h3>
      <div className="space-y-4 mb-8">
        {quiz.questions.map((question, index) => {
          const answer = result.answers[index];
          const isCorrect = answer.isCorrect;

          return (
            <div
              key={question.id}
              className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    {question.question}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Your answer:
                      </span>
                      <span
                        className={`font-medium ${
                          isCorrect
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {answer.selectedAnswer || 'Not answered'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Correct answer:
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {question.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-11 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Explanation:</span> {question.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onTryAgain}
          className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate New Quiz
        </button>
      </div>
    </div>
  );
}
