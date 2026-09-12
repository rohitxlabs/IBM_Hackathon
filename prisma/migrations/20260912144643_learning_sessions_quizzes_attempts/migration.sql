-- CreateEnum
CREATE TYPE "QuizKind" AS ENUM ('TEACHER_ASSIGNED', 'PERSONALIZED', 'SELF_PRACTICE');

-- CreateEnum
CREATE TYPE "QuizReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "ConceptLevel" AS ENUM ('WEAK', 'AVERAGE', 'STRONG');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "conversationId" TEXT;

-- AlterTable
ALTER TABLE "practice_questions" ADD COLUMN     "conceptTag" TEXT,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "practice_tests" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "kind" "QuizKind" NOT NULL DEFAULT 'SELF_PRACTICE',
ADD COLUMN     "learningSessionId" TEXT,
ADD COLUMN     "reviewStatus" "QuizReviewStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "sourceAttemptId" TEXT,
ADD COLUMN     "targetConcepts" JSONB,
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_assignments" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "classId" TEXT,
    "studentId" TEXT,
    "assignedById" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "totalQuestions" INTEGER NOT NULL,
    "score" INTEGER,
    "percentage" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_performances" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "conceptTag" TEXT NOT NULL,
    "topicId" TEXT,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "level" "ConceptLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strongAreas" JSONB NOT NULL,
    "weakAreas" JSONB NOT NULL,
    "misconceptions" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "participantAId" TEXT NOT NULL,
    "participantBId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_sessions_teacherId_idx" ON "learning_sessions"("teacherId");

-- CreateIndex
CREATE INDEX "learning_sessions_classId_idx" ON "learning_sessions"("classId");

-- CreateIndex
CREATE INDEX "learning_sessions_subjectId_idx" ON "learning_sessions"("subjectId");

-- CreateIndex
CREATE INDEX "quiz_assignments_studentId_idx" ON "quiz_assignments"("studentId");

-- CreateIndex
CREATE INDEX "quiz_assignments_classId_idx" ON "quiz_assignments"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_assignments_quizId_classId_key" ON "quiz_assignments"("quizId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_assignments_quizId_studentId_key" ON "quiz_assignments"("quizId", "studentId");

-- CreateIndex
CREATE INDEX "quiz_attempts_studentId_status_idx" ON "quiz_attempts"("studentId", "status");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_quizId_studentId_attemptNumber_key" ON "quiz_attempts"("quizId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "student_answers_questionId_idx" ON "student_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_attemptId_questionId_key" ON "student_answers"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "concept_performances_studentId_conceptTag_idx" ON "concept_performances"("studentId", "conceptTag");

-- CreateIndex
CREATE INDEX "concept_performances_studentId_createdAt_idx" ON "concept_performances"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "concept_performances_attemptId_conceptTag_key" ON "concept_performances"("attemptId", "conceptTag");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_attemptId_key" ON "ai_analyses"("attemptId");

-- CreateIndex
CREATE INDEX "ai_analyses_studentId_createdAt_idx" ON "ai_analyses"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "conversations_participantAId_lastMessageAt_idx" ON "conversations"("participantAId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "conversations_participantBId_lastMessageAt_idx" ON "conversations"("participantBId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_studentId_participantAId_participantBId_key" ON "conversations"("studentId", "participantAId", "participantBId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "practice_questions_conceptTag_idx" ON "practice_questions"("conceptTag");

-- CreateIndex
CREATE INDEX "practice_tests_kind_reviewStatus_idx" ON "practice_tests"("kind", "reviewStatus");

-- CreateIndex
CREATE INDEX "practice_tests_learningSessionId_idx" ON "practice_tests"("learningSessionId");

-- AddForeignKey
ALTER TABLE "practice_tests" ADD CONSTRAINT "practice_tests_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES "learning_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_tests" ADD CONSTRAINT "practice_tests_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "practice_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "practice_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_performances" ADD CONSTRAINT "concept_performances_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_performances" ADD CONSTRAINT "concept_performances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_performances" ADD CONSTRAINT "concept_performances_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
