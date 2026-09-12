'use client';

import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { TopicInput } from './TopicInput';
import { QuizQuestion } from './QuizQuestion';
import { QuizNavigation } from './QuizNavigation';
import { QuizResults } from './QuizResults';

export function QuizApp() {
  const {
    state,
    generateQuiz,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    tryAgain,
  } = useQuiz();

  const [topicInput, setTopicInput] = useState('');

  const handleGenerate = (topic: string) => {
    generateQuiz(topic);
  };

  const handleTryAgain = () => {
    tryAgain();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            AI Quiz Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter a topic and let AI create a quiz for you
          </p>
        </header>

        <main className="max-w-2xl mx-auto">
          {state.status === 'idle' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <TopicInput onGenerate={handleGenerate} isLoading={false} />
            </div>
          )}

          {state.status === 'generating' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Generating Quiz...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Creating questions about &quot;{state.topic}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Error Generating Quiz
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {state.error}
                </p>
                <button
                  onClick={() => generateQuiz(state.topic || topicInput)}
                  className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <TopicInput onGenerate={handleGenerate} isLoading={false} />
              </div>
            </div>
          )}

          {state.status === 'quiz' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {state.quiz.topic}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question {state.currentQuestion + 1} of {state.quiz.questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((state.currentQuestion + 1) / state.quiz.questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-8">
                <QuizQuestion
                  question={state.quiz.questions[state.currentQuestion]}
                  selectedAnswer={
                    state.answers.find(
                      (a) => a.questionId === state.quiz.questions[state.currentQuestion].id
                    )?.selectedAnswer || null
                  }
                  onSelectAnswer={(answer) =>
                    selectAnswer(
                      state.quiz.questions[state.currentQuestion].id,
                      answer
                    )
                  }
                />
              </div>

              <QuizNavigation
                questions={state.quiz.questions}
                answers={state.answers}
                currentIndex={state.currentQuestion}
                onGoToQuestion={goToQuestion}
                onPrevious={previousQuestion}
                onNext={nextQuestion}
                onSubmit={submitQuiz}
              />
            </div>
          )}

          {state.status === 'results' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <QuizResults
                quiz={state.quiz}
                result={state.result}
                onTryAgain={handleTryAgain}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
