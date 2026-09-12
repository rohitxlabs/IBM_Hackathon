/**
 * Frontend domain types.
 *
 * These describe the JSON the backend's REST API returns. They are written by
 * hand on purpose: the frontend must never import Prisma types, so this file
 * is the single place where the API's shape is expressed for the UI. Dates
 * arrive as ISO strings over HTTP, so every timestamp is typed as `string`.
 */

export type Role = "STUDENT" | "TEACHER" | "PARENT";

export type SubmissionStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";

/** Status the UI shows for an assignment the student has not handed in yet. */
export type AssignmentStatus = SubmissionStatus | "OVERDUE";

export type ExamType = "QUIZ" | "UNIT_TEST" | "MIDTERM" | "FINAL" | "PRACTICAL";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export type PracticeTestStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";

export type MistakeSource =
  | "ASSIGNMENT"
  | "EXAM"
  | "PRACTICE"
  | "SELF_REPORTED";

export type NotificationType = "ASSIGNMENT" | "GRADE" | "EXAM" | "MESSAGE";

export type WeaknessLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE";

/* --------------------------------- people -------------------------------- */

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  /** Present only for the matching role. */
  studentId?: string;
  teacherId?: string;
  parentId?: string;
}

/** Minimal person reference embedded in other payloads. */
export interface UserRef {
  id: string;
  name: string;
  email?: string;
  role?: Role;
}

export interface Student {
  id: string;
  rollNumber: string;
  gradeLevel: number;
  dateOfBirth?: string | null;
  user: UserRef;
  classes?: { enrolledAt: string; class: ClassSummary }[];
  parents?: {
    relationship: string;
    isPrimary: boolean;
    parent: { id: string; user: UserRef };
  }[];
}

export interface Teacher {
  id: string;
  employeeId?: string;
  department?: string | null;
  bio?: string | null;
  user: UserRef;
  classes?: ClassSummary[];
}

export interface Parent {
  id: string;
  phone?: string | null;
  occupation?: string | null;
  user: UserRef;
  children?: {
    relationship: string;
    isPrimary: boolean;
    student: Student;
  }[];
}

/** A child as the parent-facing screens see them. */
export interface Child {
  relationship: string;
  isPrimary: boolean;
  student: Student;
}

/* -------------------------------- classes -------------------------------- */

export interface ClassSummary {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  gradeLevel?: number;
}

export interface Class extends ClassSummary {
  createdAt: string;
  teacher: { id: string; user: UserRef };
  _count?: { students: number; subjects: number; assignments: number };
  students?: { enrolledAt: string; student: Student }[];
  subjects?: SubjectSummary[];
}

export interface ClassEnrolment {
  id: string;
  enrolledAt: string;
  student: Student;
}

/* ---------------------------- subjects & topics --------------------------- */

export interface SubjectSummary {
  id: string;
  name: string;
  code: string;
}

export interface Subject extends SubjectSummary {
  description?: string | null;
  classId?: string | null;
  teacherId?: string | null;
  createdAt?: string;
  class?: ClassSummary | null;
  teacher?: { id: string; user: UserRef } | null;
  topics?: Topic[];
  _count?: { topics: number; assignments: number; exams: number };
}

export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  subjectId?: string;
  subject?: SubjectSummary;
}

/* ------------------------- assignments & submissions ---------------------- */

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  isPublished: boolean;
  createdAt: string;
  classId: string;
  subjectId: string;
  topicId?: string | null;
  teacherId: string;
  class: ClassSummary;
  subject: SubjectSummary;
  topic?: { id: string; name: string } | null;
  teacher: { id: string; user: UserRef };
  /** Attached when the request is scoped to one student. */
  submission?: Submission | null;
  status?: AssignmentStatus;
  _count?: { submissions: number };
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string | null;
  fileUrl?: string | null;
  status: SubmissionStatus;
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
  student?: Student;
  assignment?: Assignment;
}

/** What the teacher's grading screen receives for one assignment. */
export interface SubmissionOverview {
  submissions: Submission[];
  missing: Student[];
  stats: { total: number; submitted: number; graded: number };
}

/* ----------------------------- exams & results ---------------------------- */

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  examType: ExamType;
  examDate: string;
  durationMinutes: number;
  maxScore: number;
  classId: string;
  subjectId: string;
  topicId?: string | null;
  teacherId: string;
  class: ClassSummary;
  subject: SubjectSummary;
  topic?: { id: string; name: string } | null;
  teacher: { id: string; user: UserRef };
  /** Attached when the request is scoped to one student. */
  result?: ExamResult | null;
  results?: ExamResult[];
  _count?: { results: number };
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  grade?: string | null;
  remarks?: string | null;
  createdAt: string;
  student?: Student;
  exam?: Pick<
    Exam,
    "id" | "title" | "examType" | "examDate" | "maxScore"
  > & { subject: SubjectSummary };
}

/* ------------------------------- learning -------------------------------- */

export interface Mistake {
  id: string;
  studentId: string;
  subjectId: string;
  topicId?: string | null;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation?: string | null;
  source: MistakeSource;
  sourceId?: string | null;
  createdAt: string;
  subject: SubjectSummary;
  topic?: { id: string; name: string } | null;
}

/** Counts returned when mistakes are grouped rather than listed. */
export interface MistakeGroup {
  subjectId: string;
  subject: SubjectSummary | null;
  topicId?: string | null;
  topic?: { id: string; name: string } | null;
  count: number;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  mistakeCount: number;
  practiceAttempts: number;
  practiceCorrect: number;
  practiceAccuracy: number | null;
  academicAttempts: number;
  academicAccuracy: number | null;
  weaknessScore: number;
  level: WeaknessLevel;
  isWeak: boolean;
  /** Plain-language explanation of why the topic was flagged. */
  reasons: string[];
}

export type ReviewStatus = "PENDING_REVIEW" | "APPROVED";

export type QuizKind = "TEACHER_ASSIGNED" | "PERSONALIZED" | "SELF_PRACTICE";

export interface PracticeQuestion {
  id: string;
  orderIndex: number;
  questionType: QuestionType;
  prompt: string;
  options?: string[] | null;
  topicId?: string | null;
  topic?: { id: string; name: string } | null;
  correctAnswer?: string;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  explanation?: string | null;
  conceptTag?: string | null;
  difficulty?: Difficulty;
}

export interface PracticeTest {
  id: string;
  studentId?: string;
  subjectId: string;
  topicId?: string | null;
  title: string;
  instructions?: string | null;
  difficulty: Difficulty;
  questionType: QuestionType;
  questionCount: number;
  status: PracticeTestStatus;
  kind: QuizKind;
  reviewStatus: ReviewStatus;
  learningSessionId?: string | null;
  createdByUserId?: string;
  score?: number | null;
  totalScore?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  generatedBy: string;
  createdAt: string;
  updatedAt?: string;
  subject: SubjectSummary;
  topic?: { id: string; name: string } | null;
  questions?: PracticeQuestion[];
  _count?: { questions: number; assignments?: number; attempts?: number };
  learningSession?: {
    id: string;
    title: string;
    classId: string;
    teacherId: string;
  } | null;
}

/** What creating a practice test tells the UI about how it was personalised. */
export interface PracticePersonalisation {
  weakTopicsUsed: string[];
  pastMistakesUsed: number;
  generatedBy: string;
  aiFallbackReason?: string;
}

export interface PracticeResult {
  test: PracticeTest;
  score: { correct: number; total: number; percentage: number };
  incorrect: {
    questionId: string;
    prompt: string;
    studentAnswer: string;
    correctAnswer: string;
    explanation?: string | null;
    topic: string | null;
  }[];
}

/* --------------------------- messages & alerts ---------------------------- */

export interface Message {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  studentId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  sender: UserRef;
  recipient: UserRef;
  student: { id: string; rollNumber: string; user: UserRef };
}

export interface MessageContact {
  student: { id: string; name: string };
  contacts: {
    userId: string;
    name: string;
    role: Role;
    context: string;
  }[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

/* -------------------------- progress & dashboards ------------------------- */

export interface StudentProgress {
  studentId: string;
  assignments: {
    total: number;
    submitted: number;
    graded: number;
    pending: number;
    overdue: number;
    completionRate: number;
    averageScore: number | null;
  };
  exams: {
    taken: number;
    upcoming: number;
    averageScore: number | null;
    best: { title: string; percentage: number } | null;
  };
  practice: { completed: number; averageScore: number | null };
  mistakes: { total: number; last30Days: number };
  subjects: {
    subjectId: string;
    subjectName: string;
    averageScore: number | null;
    gradedItems: number;
  }[];
}

export interface StudentDashboard {
  role: "STUDENT";
  progress: StudentProgress;
  weakTopics: WeakTopic[];
  classes: (ClassSummary & { teacher: { user: UserRef } })[];
  upcomingAssignments: {
    id: string;
    title: string;
    dueDate: string;
    maxScore: number;
    subject: { name: string };
  }[];
  upcomingExams: {
    id: string;
    title: string;
    examDate: string;
    examType: ExamType;
    subject: { name: string };
  }[];
  recentGrades: {
    id: string;
    score: number | null;
    gradedAt: string | null;
    assignment: {
      id: string;
      title: string;
      maxScore: number;
      subject: { name: string };
    };
  }[];
  practiceTests: {
    id: string;
    title: string;
    status: PracticeTestStatus;
    score: number | null;
    totalScore: number | null;
    subject: { name: string };
  }[];
  unreadNotifications: number;
}

export interface TeacherDashboard {
  role: "TEACHER";
  totals: { classes: number; students: number; pendingGrading: number };
  classes: (ClassSummary & {
    averageScore: number | null;
    _count: { students: number; assignments: number; exams: number };
  })[];
  upcomingExams: {
    id: string;
    title: string;
    examDate: string;
    class: { name: string; section: string };
  }[];
  recentSubmissions: {
    id: string;
    status: SubmissionStatus;
    submittedAt: string;
    student: { id: string; user: UserRef };
    assignment: { id: string; title: string };
  }[];
  classWeakTopics: {
    topicId: string | null;
    topicName: string | null;
    subjectName: string | null;
    mistakeCount: number;
  }[];
  unreadMessages: number;
}

export interface ParentDashboard {
  role: "PARENT";
  children: {
    relationship: string;
    student: {
      id: string;
      name: string;
      rollNumber: string;
      gradeLevel: number;
    };
    classes: ClassSummary[];
    teachers: { userId: string; name: string; context: string }[];
    progress: StudentProgress;
    weakTopics: WeakTopic[];
    pendingHomework: {
      id: string;
      title: string;
      dueDate: string;
      subject: { name: string };
    }[];
    upcomingExams: {
      id: string;
      title: string;
      examDate: string;
      subject: { name: string };
    }[];
    recentGrades: {
      id: string;
      score: number;
      grade: string | null;
      exam: { id: string; title: string; maxScore: number };
    }[];
  }[];
  unreadMessages: number;
}

export type Dashboard =
  | StudentDashboard
  | TeacherDashboard
  | ParentDashboard;
