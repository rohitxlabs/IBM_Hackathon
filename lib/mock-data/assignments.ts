export type AssignmentStatus = "pending" | "submitted" | "graded";

export type MockAssignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
};

const assignments: MockAssignment[] = [];

export function getAssignmentsByStudent(_studentId?: string): MockAssignment[] {
  void _studentId;
  return assignments;
}
