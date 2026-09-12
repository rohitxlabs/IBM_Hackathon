"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import { Badge, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import type {
  Difficulty as DifficultyT,
  PracticeQuestion,
  PracticeTest,
  ReviewStatus,
} from "@/lib/api/types";

type Difficulty = DifficultyT;

type QuizWithQuestions = PracticeTest & {
  questions: NonNullable<PracticeTest["questions"]>;
};

type FormState = {
  topic: string;
  subjectId: string;
  classId: string;
  gradeLevel: number;
  difficulty: Difficulty;
  questionCount: number;
  dueDate: string;
};

type WorkflowStep = "form" | "generate" | "preview" | "approve" | "assign";

const STEPS: { key: WorkflowStep; label: string }[] = [
  { key: "form", label: "Form" },
  { key: "generate", label: "Generate" },
  { key: "preview", label: "Preview" },
  { key: "approve", label: "Approve" },
  { key: "assign", label: "Assign" },
];

const INITIAL_FORM: FormState = {
  topic: "",
  subjectId: "sub-math",
  classId: "",
  gradeLevel: 8,
  difficulty: "MEDIUM",
  questionCount: 10,
  dueDate: "",
};

const SUBJECT_OPTIONS = [
  { value: "sub-math", label: "Mathematics" },
  { value: "sub-sci", label: "Science" },
  { value: "sub-eng", label: "English" },
  { value: "sub-his", label: "History" },
  { value: "sub-prog", label: "Computer Science" },
];

const CLASS_OPTIONS = [
  { value: "c1", label: "Class 8A" },
  { value: "c2", label: "Class 8B" },
  { value: "c3", label: "Class 9A" },
  { value: "c4", label: "Class 10A" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20].map((n) => ({
  value: String(n),
  label: `${n} questions`,
}));

const GRADE_LEVEL_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1).map(
  (n) => ({ value: String(n), label: `Grade ${n}` })
);

export default function TeacherQuizzesPage() {
  const [step, setStep] = useState<WorkflowStep>("form");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedQuizzes, setSavedQuizzes] = useState<PracticeTest[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [preview, setPreview] = useState<QuizWithQuestions | null>(null);
  const [generatedBy, setGeneratedBy] = useState<"gemini" | "mock">("mock");
  const [fallback, setFallback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ quizzes: PracticeTest[] }>("/api/quizzes?kind=TEACHER_ASSIGNED")
      .then((data) => setSavedQuizzes(data.quizzes))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoadingList(false));
  }, []);

  const canGenerate = useMemo(
    () => form.topic.trim().length >= 3 && form.subjectId.length > 0,
    [form.topic, form.subjectId]
  );

  const resetWorkflow = useCallback(() => {
    setStep("form");
    setPreview(null);
    setFallback(null);
    setError(null);
  }, []);

  const goToStep = useCallback((next: WorkflowStep) => {
    setError(null);
    setStep(next);
  }, []);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setGenerating(true);
    setPreview(null);
    setFallback(null);
    goToStep("generate");
    try {
      const data = await api.post<{
        quiz: QuizWithQuestions;
        generatedBy: "gemini" | "mock";
        aiFallbackReason?: string;
      }>("/api/quizzes/generate-from-topic", {
        topic: form.topic,
        subjectId: form.subjectId,
        classId: form.classId || undefined,
        gradeLevel: form.gradeLevel,
        difficulty: form.difficulty,
        questionCount: form.questionCount,
        assignToClass: false,
      });
      setPreview(data.quiz);
      setGeneratedBy(data.generatedBy);
      setFallback(data.aiFallbackReason ?? null);
      setSavedQuizzes((prev) => [data.quiz, ...prev]);
      goToStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      goToStep("form");
    } finally {
      setGenerating(false);
    }
  }, [form, goToStep]);

  const handleApprove = useCallback(
    async (quizId: string) => {
      setActionLoading(`approve-${quizId}`);
      try {
        const data = await api.post<{ quiz: PracticeTest }>(
          `/api/quizzes/${quizId}/approve`
        );
        setSavedQuizzes((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, ...data.quiz } : q))
        );
        if (preview?.id === quizId) {
          setPreview({ ...preview, ...data.quiz });
        }
        goToStep("approve");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve quiz");
      } finally {
        setActionLoading(null);
      }
    },
    [preview, goToStep]
  );

  const handleAssign = useCallback(
    async (quizId: string) => {
      if (!form.classId) {
        setError("Select a class before assigning this quiz");
        return;
      }
      setActionLoading(`assign-${quizId}`);
      try {
        await api.post(`/api/quizzes/${quizId}/assign`, {
          classId: form.classId,
          dueDate: form.dueDate || undefined,
        });
        goToStep("assign");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign quiz");
      } finally {
        setActionLoading(null);
      }
    },
    [form.classId, form.dueDate, goToStep]
  );

  const handleRegenerate = useCallback(
    async (quizId: string) => {
      setActionLoading(`regen-${quizId}`);
      try {
        const data = await api.post<QuizWithQuestions>(
          `/api/quizzes/${quizId}/regenerate`
        );
        setSavedQuizzes((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, ...data } : q))
        );
        if (preview?.id === quizId) setPreview({ ...preview, ...data });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to regenerate");
      } finally {
        setActionLoading(null);
      }
    },
    [preview]
  );

  const loadQuizForPreview = useCallback(
    async (quizId: string) => {
      try {
        const quiz = await api.get<QuizWithQuestions>(`/api/quizzes/${quizId}`);
        setPreview(quiz);
        setStep("preview");
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    []
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">AI Quiz Studio</h1>
        <p className="text-gray-600 mt-1">
          Give Jinni a topic and it will build a custom MCQ quiz. Walk through
          the five steps to preview, approve, and assign the quiz to your
          students.
        </p>
      </header>

      <Stepper current={step} />

      {error ? (
        <div className="rounded-[var(--radius-sm)] border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {step === "form" && (
        <FormStep
          form={form}
          setForm={setForm}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
          generating={generating}
        />
      )}

      {step === "generate" && (
        <GenerateStep
          generating={generating}
          topic={form.topic}
          onBack={() => goToStep("form")}
          onRetry={handleGenerate}
          previewReady={preview !== null}
        />
      )}

      {step === "preview" && preview && (
        <PreviewStep
          quiz={preview}
          generatedBy={generatedBy}
          fallback={fallback}
          actionLoading={actionLoading}
          onBack={() => goToStep("generate")}
          onRegenerate={() => handleRegenerate(preview.id)}
          onNext={() =>
            preview.reviewStatus === "APPROVED"
              ? goToStep("approve")
              : handleApprove(preview.id)
          }
        />
      )}

      {step === "approve" && preview && (
        <ApproveStep
          quiz={preview}
          onBack={() => goToStep("preview")}
          onNext={() => goToStep("assign")}
          onApprove={() => handleApprove(preview.id)}
          actionLoading={actionLoading}
        />
      )}

      {step === "assign" && preview && (
        <AssignStep
          quiz={preview}
          form={form}
          setForm={setForm}
          actionLoading={actionLoading}
          onBack={() => goToStep("approve")}
          onAssign={() => handleAssign(preview.id)}
          onRestart={resetWorkflow}
        />
      )}

      <SavedQuizzesSection
        savedQuizzes={savedQuizzes}
        loadingList={loadingList}
        onPreview={loadQuizForPreview}
        onApprove={handleApprove}
        onAssign={handleAssign}
        actionLoading={actionLoading}
        canAssign={form.classId.length > 0}
      />
    </div>
  );
}

/* --------------------------------- Stepper -------------------------------- */

function Stepper({ current }: { current: WorkflowStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Quiz workflow" className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li
              key={s.key}
              className="flex-1 flex items-center gap-2 min-w-0"
            >
              <div
                className={`
                  flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-sm font-semibold
                  ${done
                    ? "bg-primary-600 text-white"
                    : active
                      ? "bg-primary-600 text-white ring-4 ring-primary-100"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-medium truncate min-w-0 ${
                  done || active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 ? (
                <div
                  className={`flex-1 h-0.5 rounded ${
                    done ? "bg-primary-300" : "bg-gray-200"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------- Step 1 - Form --------------------------- */

function FormStep(props: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  canGenerate: boolean;
  onGenerate: () => void;
  generating: boolean;
}) {
  const { form, setForm, canGenerate, onGenerate, generating } = props;

  return (
    <Card>
      <CardHeader
        title="Step 1 — Describe the quiz"
        description="Tell Jinni what to test. Be specific with the topic for best results."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="md:col-span-2">
          <Input
            label="Topic"
            value={form.topic}
            onChange={(e) =>
              setForm((f) => ({ ...f, topic: e.target.value }))
            }
            placeholder="e.g. Linear equations, Photosynthesis, World War II causes…"
            hint='Be specific — "Quadratic formula" gives better questions than "Math".'
            autoFocus
          />
        </div>

        <Select
          label="Subject"
          value={form.subjectId}
          onChange={(e) =>
            setForm((f) => ({ ...f, subjectId: e.target.value }))
          }
          options={SUBJECT_OPTIONS}
        />

        <Select
          label="Class"
          value={form.classId}
          onChange={(e) =>
            setForm((f) => ({ ...f, classId: e.target.value }))
          }
          options={[
            { value: "", label: "Select a class…" },
            ...CLASS_OPTIONS,
          ]}
          hint="Used later when assigning the quiz to students."
        />

        <Select
          label="Grade level"
          value={String(form.gradeLevel)}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              gradeLevel: Number(e.target.value),
            }))
          }
          options={GRADE_LEVEL_OPTIONS}
        />

        <Select
          label="Difficulty"
          value={form.difficulty}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              difficulty: e.target.value as Difficulty,
            }))
          }
          options={DIFFICULTY_OPTIONS}
        />

        <Select
          label="Number of questions"
          value={String(form.questionCount)}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              questionCount: Number(e.target.value),
            }))
          }
          options={QUESTION_COUNT_OPTIONS}
        />

        <div className="md:col-span-2 flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <p className="text-sm text-gray-500 max-w-md">
            Ready? Jinni will use Gemini to generate MCQ questions tailored to
            the grade level and difficulty you selected.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={generating}
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            Generate Quiz →
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- Step 2 - Generate -------------------------- */

function GenerateStep(props: {
  generating: boolean;
  topic: string;
  onBack: () => void;
  onRetry: () => void;
  previewReady: boolean;
}) {
  const { generating, topic, onBack, onRetry, previewReady } = props;
  return (
    <Card>
      <CardHeader
        title="Step 2 — AI is building your quiz"
        description={`Topic: "${topic}"`}
      />
      <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
        {generating ? (
          <>
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🧞
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Jinni is crafting your questions…
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Gemini reads the topic, grade level and difficulty, then writes
              the question stems, options, answer key and per-question
              explanations.
            </p>
          </>
        ) : previewReady ? (
          <>
            <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center text-success-600 mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz generated successfully
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Moving to the preview step so you can review every question and
              its correct answer before approving.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center text-danger-600 mb-6">
              !
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generation could not complete
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Use the buttons below to try again or go back and adjust the
              topic.
            </p>
          </>
        )}
      </div>
      {!generating && (
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back to form
          </Button>
          {!previewReady && (
            <Button variant="primary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- Step 3 - Preview --------------------------- */

function PreviewStep(props: {
  quiz: QuizWithQuestions;
  generatedBy: "gemini" | "mock";
  fallback: string | null;
  actionLoading: string | null;
  onBack: () => void;
  onRegenerate: () => void;
  onNext: () => void;
}) {
  const {
    quiz,
    generatedBy,
    fallback,
    actionLoading,
    onBack,
    onRegenerate,
    onNext,
  } = props;
  const approved = quiz.reviewStatus === "APPROVED";

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Step 3 — Preview every question
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Review stems, options, correct answers and explanations before you
            approve the quiz.
          </p>
        </div>
      </CardHeader>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Badge variant={reviewBadge(quiz.reviewStatus)}>
          {quiz.reviewStatus.replace("_", " ")}
        </Badge>
        <Badge variant={difficultyBadge(quiz.difficulty)}>
          {quiz.difficulty}
        </Badge>
        <Badge variant="secondary">{quiz.questions.length} questions</Badge>
        <Badge variant="outline">Generator: {generatedBy}</Badge>
        {fallback ? <Badge variant="danger">Fallback: {fallback}</Badge> : null}
      </div>

      <div className="space-y-5 mt-6">
        {quiz.questions.map((q, idx) => (
          <QuestionCard key={q.id} q={q} index={idx} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <Button
            variant="secondary"
            onClick={onRegenerate}
            loading={actionLoading === `regen-${quiz.id}`}
          >
            Regenerate all
          </Button>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          loading={
            !approved && actionLoading === `approve-${quiz.id}`
              ? true
              : false
          }
        >
          {approved ? "Continue →" : "Approve & Continue →"}
        </Button>
      </div>
    </Card>
  );
}

function QuestionCard({
  q,
  index,
}: {
  q: PracticeQuestion;
  index: number;
}) {
  const correct = (q.correctAnswer ?? "").toLowerCase();
  return (
    <div className="rounded-[var(--radius-md)] border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="font-medium text-gray-900">
          <span className="text-primary-700 mr-2">Q{index + 1}.</span>
          {q.prompt}
        </p>
        <Badge variant={difficultyBadge(q.difficulty ?? "MEDIUM")}>
          {q.conceptTag ?? q.difficulty ?? "—"}
        </Badge>
      </div>
      <ul className="space-y-2">
        {q.options?.map((option, optIdx) => {
          const isCorrect = option.toLowerCase() === correct;
          return (
            <li
              key={option}
              className={`px-3 py-2 rounded-[var(--radius-sm)] text-sm border ${
                isCorrect
                  ? "border-success-300 bg-success-50 text-success-800"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <span className="font-semibold mr-2">
                {String.fromCharCode(65 + optIdx)}.
              </span>
              {option}
              {isCorrect ? (
                <span className="ml-2 text-success-600 font-semibold">
                  ✓ Correct
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {q.explanation ? (
        <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
          <span className="font-semibold text-gray-700">Explanation: </span>
          {q.explanation}
        </p>
      ) : null}
    </div>
  );
}

/* ----------------------------- Step 4 - Approve --------------------------- */

function ApproveStep(props: {
  quiz: QuizWithQuestions;
  onBack: () => void;
  onNext: () => void;
  onApprove: () => void;
  actionLoading: string | null;
}) {
  const { quiz, onBack, onNext, onApprove, actionLoading } = props;
  const approved = quiz.reviewStatus === "APPROVED";
  const correctCount = quiz.questions.filter(
    (q) => q.correctAnswer && q.correctAnswer.length > 0
  ).length;

  return (
    <Card>
      <CardHeader
        title="Step 4 — Approve the quiz"
        description="Once approved, Jinni can assign it to students in your class."
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="Questions"
          value={`${quiz.questions.length}`}
          icon="📝"
        />
        <Stat
          label="With answers"
          value={`${correctCount}/${quiz.questions.length}`}
          icon="✅"
        />
        <Stat
          label="Status"
          value={approved ? "Approved" : "Pending review"}
          icon={approved ? "🟢" : "🟡"}
        />
      </div>

      <div className="mt-6 rounded-[var(--radius-md)] border border-primary-200 bg-primary-50 p-4">
        <h4 className="font-semibold text-primary-900">
          Before you approve
        </h4>
        <ul className="mt-2 text-sm text-primary-800 list-disc pl-5 space-y-1">
          <li>Read every question stem and confirm it matches the topic.</li>
          <li>Verify only one option is marked correct per question.</li>
          <li>
            Check that the explanations are accurate and useful for students.
          </li>
          <li>
            If anything is off, go back to Preview and regenerate the full
            quiz.
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back to preview
        </Button>
        {approved ? (
          <Button variant="primary" size="lg" onClick={onNext}>
            Continue to assign →
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={onApprove}
            loading={actionLoading === `approve-${quiz.id}`}
          >
            ✓ Approve quiz
          </Button>
        )}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-gray-100 flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Step 5 - Assign ---------------------------- */

function AssignStep(props: {
  quiz: QuizWithQuestions;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  actionLoading: string | null;
  onBack: () => void;
  onAssign: () => void;
  onRestart: () => void;
}) {
  const { quiz, form, setForm, actionLoading, onBack, onAssign, onRestart } =
    props;
  const assigned =
    actionLoading === null &&
    (quiz._count?.assignments ?? 0) > 0;

  return (
    <Card>
      <CardHeader
        title="Step 5 — Assign to your class"
        description="Pick a class and optional due date to publish the quiz."
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Class"
          value={form.classId}
          onChange={(e) =>
            setForm((f) => ({ ...f, classId: e.target.value }))
          }
          options={[
            { value: "", label: "Select a class…" },
            ...CLASS_OPTIONS,
          ]}
        />

        <Input
          label="Due date (optional)"
          type="date"
          value={form.dueDate}
          onChange={(e) =>
            setForm((f) => ({ ...f, dueDate: e.target.value }))
          }
        />
      </div>

      {assigned ? (
        <div className="mt-6 rounded-[var(--radius-md)] border border-success-200 bg-success-50 p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-success-100 flex items-center justify-center text-3xl mb-4">
            🎉
          </div>
          <h3 className="text-xl font-semibold text-success-900">
            Quiz assigned!
          </h3>
          <p className="mt-2 text-sm text-success-800 max-w-md mx-auto">
            Students in{" "}
            <b>
              {CLASS_OPTIONS.find((c) => c.value === form.classId)?.label ??
                "your class"}
            </b>{" "}
            can now see &ldquo;{quiz.title}&rdquo; on their dashboard.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          {assigned && (
            <Button variant="secondary" onClick={onRestart}>
              Start another quiz
            </Button>
          )}
        </div>
        {!assigned && (
          <Button
            variant="primary"
            size="lg"
            onClick={onAssign}
            loading={actionLoading === `assign-${quiz.id}`}
            disabled={!form.classId}
          >
            {form.classId ? "✓ Assign quiz" : "Pick a class first"}
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------ Saved quizzes ----------------------------- */

function SavedQuizzesSection(props: {
  savedQuizzes: PracticeTest[];
  loadingList: boolean;
  onPreview: (id: string) => void;
  onApprove: (id: string) => void;
  onAssign: (id: string) => void;
  actionLoading: string | null;
  canAssign: boolean;
}) {
  const {
    savedQuizzes,
    loadingList,
    onPreview,
    onApprove,
    onAssign,
    actionLoading,
    canAssign,
  } = props;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Your quizzes
      </h2>
      {loadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="h-24" />
            </Card>
          ))}
        </div>
      ) : savedQuizzes.length === 0 ? (
        <EmptyQuizzes />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedQuizzes.map((q) => (
            <QuizCard
              key={q.id}
              quiz={q}
              onPreview={() => onPreview(q.id)}
              onApprove={() => onApprove(q.id)}
              onAssign={() => onAssign(q.id)}
              actionLoading={actionLoading}
              canAssign={canAssign}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function QuizCard(props: {
  quiz: PracticeTest;
  onPreview: () => void;
  onApprove: () => void;
  onAssign: () => void;
  actionLoading: string | null;
  canAssign: boolean;
}) {
  const { quiz, onPreview, onApprove, onAssign, actionLoading, canAssign } =
    props;
  const approved = quiz.reviewStatus === "APPROVED";

  return (
    <Card hover>
      <h3 className="font-semibold text-gray-900 line-clamp-2">{quiz.title}</h3>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Badge variant={reviewBadge(quiz.reviewStatus)}>
          {quiz.reviewStatus.replace("_", " ")}
        </Badge>
        <Badge variant={difficultyBadge(quiz.difficulty)}>
          {quiz.difficulty}
        </Badge>
        <Badge variant="default">{quiz.questionCount} Qs</Badge>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Subject: {quiz.subject?.name ?? "—"} · Created{" "}
        {new Date(quiz.createdAt).toLocaleDateString()}
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={onPreview}>
          Review
        </Button>
        {!approved ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onApprove}
            loading={actionLoading === `approve-${quiz.id}`}
          >
            Approve
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onAssign}
            loading={actionLoading === `assign-${quiz.id}`}
            disabled={!canAssign}
          >
            {canAssign ? "Assign" : "Need class"}
          </Button>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function difficultyBadge(d: Difficulty): "success" | "warning" | "danger" {
  switch (d) {
    case "EASY":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HARD":
      return "danger";
  }
}

function reviewBadge(
  status: ReviewStatus
): "success" | "warning" | "default" {
  switch (status) {
    case "PENDING_REVIEW":
      return "warning";
    case "APPROVED":
      return "success";
    default:
      return "default";
  }
}

function EmptyQuizzes() {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <div className="text-4xl mb-3">🧞‍♂️</div>
      <h3 className="text-lg font-semibold text-gray-900">No quizzes yet</h3>
      <p className="text-gray-600 mt-1 max-w-md mx-auto">
        Fill in the topic at the top of the page and click <b>Generate Quiz</b>{" "}
        — walk through the five-step workflow to publish your first AI quiz.
      </p>
    </div>
  );
}
