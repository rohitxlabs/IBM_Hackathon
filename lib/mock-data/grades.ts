export type MockGrade = {
  id: string;
  title: string;
  subject: string;
  type: string;
  date: string;
  score: number;
  maxScore: number;
};

export type MockPerformancePoint = {
  month: string;
  score: number;
  attendance: number;
};

export type MockSubjectPerformance = {
  subject: string;
  score: number;
  trend: "up" | "down" | "flat";
};

export const mockPerformanceData: MockPerformancePoint[] = [
  { month: "Jan", score: 72, attendance: 92 },
  { month: "Feb", score: 78, attendance: 94 },
  { month: "Mar", score: 76, attendance: 91 },
  { month: "Apr", score: 82, attendance: 96 },
  { month: "May", score: 85, attendance: 95 },
  { month: "Jun", score: 88, attendance: 97 },
  { month: "Jul", score: 84, attendance: 94 },
  { month: "Aug", score: 90, attendance: 98 },
  { month: "Sep", score: 92, attendance: 99 },
];

export const mockSubjectPerformance: MockSubjectPerformance[] = [
  { subject: "Mathematics", score: 91, trend: "up" },
  { subject: "Physics", score: 86, trend: "up" },
  { subject: "English Literature", score: 82, trend: "flat" },
  { subject: "Chemistry", score: 78, trend: "down" },
  { subject: "Biology", score: 88, trend: "up" },
  { subject: "History", score: 74, trend: "flat" },
];

export const mockGrades: MockGrade[] = [
  {
    id: "g1",
    title: "Algebra Quiz",
    subject: "Mathematics",
    type: "Quiz",
    date: "2026-09-05",
    score: 45,
    maxScore: 50,
  },
  {
    id: "g2",
    title: "Term 1 Midterm",
    subject: "Physics",
    type: "Exam",
    date: "2026-09-01",
    score: 68,
    maxScore: 80,
  },
  {
    id: "g3",
    title: "Poetry Commentary",
    subject: "English Literature",
    type: "Essay",
    date: "2026-08-28",
    score: 33,
    maxScore: 40,
  },
  {
    id: "g4",
    title: "Balancing Reactions",
    subject: "Chemistry",
    type: "Lab",
    date: "2026-08-25",
    score: 26,
    maxScore: 35,
  },
  {
    id: "g5",
    title: "Cell Biology Test",
    subject: "Biology",
    type: "Test",
    date: "2026-08-22",
    score: 44,
    maxScore: 50,
  },
  {
    id: "g6",
    title: "Industrial Revolution",
    subject: "History",
    type: "Assignment",
    date: "2026-08-18",
    score: 28,
    maxScore: 40,
  },
  {
    id: "g7",
    title: "Trigonometry Problem Set",
    subject: "Mathematics",
    type: "Assignment",
    date: "2026-08-15",
    score: 38,
    maxScore: 40,
  },
  {
    id: "g8",
    title: "Mechanics Lab Practicals",
    subject: "Physics",
    type: "Practical",
    date: "2026-08-10",
    score: 55,
    maxScore: 60,
  },
];

export function getAverageGrade(): number {
  if (mockGrades.length === 0) return 0;
  const total = mockGrades.reduce(
    (acc, g) => ({ score: acc.score + g.score, max: acc.max + (g.maxScore ?? 0) }),
    { score: 0, max: 0 }
  );
  if (total.max === 0) return 0;
  return Math.round((total.score / total.max) * 100);
}
