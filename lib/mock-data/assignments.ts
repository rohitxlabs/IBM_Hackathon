import type { Assignment } from "../types";

export const mockAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Quadratic Equations Problem Set",
    description: "Solve the following quadratic equations using factoring and quadratic formula.",
    subject: "Mathematics",
    courseId: "c1",
    dueDate: "2026-09-10",
    status: "pending",
    maxScore: 100,
  },
  {
    id: "a2",
    title: "Newton's Laws Lab Report",
    description: "Write a detailed lab report on the Newton's Laws experiment conducted in class.",
    subject: "Physics",
    courseId: "c2",
    dueDate: "2026-09-12",
    status: "submitted",
    submittedAt: "2026-09-08",
    maxScore: 100,
  },
  {
    id: "a3",
    title: "Essay: Shakespeare's Hamlet",
    description: "Write a 1000-word essay analyzing the character of Hamlet.",
    subject: "English",
    courseId: "c3",
    dueDate: "2026-09-15",
    status: "pending",
    maxScore: 100,
  },
  {
    id: "a4",
    title: "Chemical Bonding Worksheet",
    description: "Complete the worksheet on ionic and covalent bonding.",
    subject: "Chemistry",
    courseId: "c4",
    dueDate: "2026-09-08",
    status: "graded",
    score: 92,
    gradedAt: "2026-09-09",
    feedback: "Excellent work! Your understanding of chemical bonds is impressive.",
    maxScore: 100,
  },
  {
    id: "a5",
    title: "World War II Timeline",
    description: "Create a detailed timeline of major events during World War II.",
    subject: "History",
    courseId: "c5",
    dueDate: "2026-09-20",
    status: "pending",
    maxScore: 100,
  },
  {
    id: "a6",
    title: "Cell Division Diagram",
    description: "Draw and label the stages of mitosis and meiosis.",
    subject: "Biology",
    courseId: "c6",
    dueDate: "2026-09-05",
    status: "graded",
    score: 88,
    gradedAt: "2026-09-06",
    feedback: "Good diagrams, but review the cytokinesis stage.",
    maxScore: 100,
  },
  {
    id: "a7",
    title: "Statistics Project",
    description: "Collect and analyze data on a topic of your choice using statistical methods.",
    subject: "Mathematics",
    courseId: "c1",
    dueDate: "2026-09-25",
    status: "pending",
    maxScore: 150,
  },
  {
    id: "a8",
    title: "Physics Problem Set",
    description: "Solve problems related to motion and forces.",
    subject: "Physics",
    courseId: "c2",
    dueDate: "2026-09-01",
    status: "overdue",
    maxScore: 100,
  },
];

export function getAssignmentsByStudent(): Assignment[] {
  return mockAssignments;
}

export function getAssignmentsByStatus(status: Assignment["status"]): Assignment[] {
  return mockAssignments.filter((a) => a.status === status);
}

export function getAssignmentsBySubject(subject: string): Assignment[] {
  return mockAssignments.filter((a) => a.subject === subject);
}

export function getAssignmentById(id: string): Assignment | undefined {
  return mockAssignments.find((a) => a.id === id);
}

export function getPendingAssignmentsCount(): number {
  return mockAssignments.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  ).length;
}

export function getAssignmentStats() {
  const total = mockAssignments.length;
  const pending = mockAssignments.filter((a) => a.status === "pending").length;
  const submitted = mockAssignments.filter((a) => a.status === "submitted").length;
  const graded = mockAssignments.filter((a) => a.status === "graded").length;
  const overdue = mockAssignments.filter((a) => a.status === "overdue").length;

  return { total, pending, submitted, graded, overdue };
}
