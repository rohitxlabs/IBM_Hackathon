import type { Grade, SubjectPerformance, PerformanceData } from "../types";

export const mockGrades: Grade[] = [
  {
    id: "g1",
    subject: "Mathematics",
    score: 85,
    maxScore: 100,
    date: "2026-08-15",
    type: "quiz",
    title: "Algebra Quiz",
  },
  {
    id: "g2",
    subject: "Physics",
    score: 92,
    maxScore: 100,
    date: "2026-08-18",
    type: "exam",
    title: "Mid-term Exam",
  },
  {
    id: "g3",
    subject: "English",
    score: 78,
    maxScore: 100,
    date: "2026-08-20",
    type: "assignment",
    title: "Essay Writing",
  },
  {
    id: "g4",
    subject: "Chemistry",
    score: 88,
    maxScore: 100,
    date: "2026-08-22",
    type: "quiz",
    title: "Periodic Table Quiz",
  },
  {
    id: "g5",
    subject: "History",
    score: 95,
    maxScore: 100,
    date: "2026-08-25",
    type: "project",
    title: "Research Project",
  },
  {
    id: "g6",
    subject: "Biology",
    score: 82,
    maxScore: 100,
    date: "2026-08-28",
    type: "exam",
    title: "Cell Biology Exam",
  },
  {
    id: "g7",
    subject: "Mathematics",
    score: 90,
    maxScore: 100,
    date: "2026-09-01",
    type: "exam",
    title: "Geometry Exam",
  },
  {
    id: "g8",
    subject: "Physics",
    score: 88,
    maxScore: 100,
    date: "2026-09-03",
    type: "quiz",
    title: "Motion Quiz",
  },
];

export const mockPerformanceData: PerformanceData[] = [
  { month: "Apr", score: 75, attendance: 92 },
  { month: "May", score: 78, attendance: 88 },
  { month: "Jun", score: 82, attendance: 95 },
  { month: "Jul", score: 80, attendance: 90 },
  { month: "Aug", score: 85, attendance: 93 },
  { month: "Sep", score: 88, attendance: 91 },
];

export const mockSubjectPerformance: SubjectPerformance[] = [
  { subject: "Mathematics", score: 87, trend: "up" },
  { subject: "Physics", score: 90, trend: "up" },
  { subject: "English", score: 78, trend: "stable" },
  { subject: "Chemistry", score: 88, trend: "up" },
  { subject: "History", score: 95, trend: "up" },
  { subject: "Biology", score: 82, trend: "down" },
];

export function getGradesBySubject(subject: string): Grade[] {
  return mockGrades.filter((g) => g.subject === subject);
}

export function getGradesByType(type: Grade["type"]): Grade[] {
  return mockGrades.filter((g) => g.type === type);
}

export function getAverageGrade(): number {
  const total = mockGrades.reduce((sum, g) => sum + g.score, 0);
  return Math.round(total / mockGrades.length);
}

export function getSubjectAverage(subject: string): number {
  const subjectGrades = getGradesBySubject(subject);
  if (subjectGrades.length === 0) return 0;
  const total = subjectGrades.reduce((sum, g) => sum + g.score, 0);
  return Math.round(total / subjectGrades.length);
}

export function getRecentGrades(limit: number = 5): Grade[] {
  return [...mockGrades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
