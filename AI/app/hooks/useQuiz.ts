'use client';

import { useState, useCallback } from 'react';
import { Quiz, QuizAnswer, QuizResult, QuizState } from '@/lib/types';

export function useQuiz() {
  const [state, setState] = useState<QuizState>({ status: 'idle' });

  const generateQuiz = useCallback(async (topic: string) => {
    if (!topic.trim()) {
      setState({ status: 'error', error: 'Please enter a topic' });
      return;
    }

    setState({ status: 'generating', topic: topic.trim() });

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const quiz: Quiz = {
        topic: topic.trim(),
        questions: data.questions,
      };

      const answers: QuizAnswer[] = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: null,
      }));

      setState({
        status: 'quiz',
        quiz,
        currentQuestion: 0,
        answers,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ status: 'error', error: errorMessage, topic });
    }
  }, []);

  const selectAnswer = useCallback((questionId: number, answer: string) => {
    setState((prev) => {
      if (prev.status !== 'quiz') return prev;

      const newAnswers = prev.answers.map((a) =>
        a.questionId === questionId ? { ...a, selectedAnswer: answer } : a
      );

      return { ...prev, answers: newAnswers };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => {
      if (prev.status !== 'quiz') return prev;
      if (index < 0 || index >= prev.quiz.questions.length) return prev;
      return { ...prev, currentQuestion: index };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'quiz') return prev;
      if (prev.currentQuestion >= prev.quiz.questions.length - 1) return prev;
      return { ...prev, currentQuestion: prev.currentQuestion + 1 };
    });
  }, []);

  const previousQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'quiz') return prev;
      if (prev.currentQuestion <= 0) return prev;
      return { ...prev, currentQuestion: prev.currentQuestion - 1 };
    });
  }, []);

  const submitQuiz = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'quiz') return prev;

      let correctAnswers = 0;
      const resultAnswers = prev.answers.map((answer) => {
        const question = prev.quiz.questions.find((q) => q.id === answer.questionId);
        const isCorrect = answer.selectedAnswer === question?.correctAnswer;
        if (isCorrect) correctAnswers++;
        return { ...answer, isCorrect };
      });

      const totalQuestions = prev.quiz.questions.length;
      const incorrectAnswers = totalQuestions - correctAnswers;
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);

      const result: QuizResult = {
        score: correctAnswers,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        percentage,
        answers: resultAnswers,
      };

      return { status: 'results', result, quiz: prev.quiz };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const tryAgain = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'results') return prev;
      const topic = prev.quiz.topic;
      return { status: 'idle' };
    });
  }, []);

  return {
    state,
    generateQuiz,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    tryAgain,
  };
}
