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

export const mockPerformanceData: MockPerformancePoint[] = [];

export const mockSubjectPerformance: MockSubjectPerformance[] = [];

export const mockGrades: MockGrade[] = [];

export function getAverageGrade(): number {
  if (mockGrades.length === 0) return 0;
  const total = mockGrades.reduce(
    (acc, g) => ({ score: acc.score + g.score, max: acc.max + (g.maxScore ?? 0) }),
    { score: 0, max: 0 }
  );
  if (total.max === 0) return 0;
  return Math.round((total.score / total.max) * 100);
}
