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

const assignments: MockAssignment[] = [
  {
    id: "a1",
    title: "Quadratic Equations Problem Set",
    subject: "Mathematics",
    description:
      "Solve problems 1–15 from Chapter 4. Show all steps of your working for full marks.",
    dueDate: "2026-09-20",
    status: "pending",
    maxScore: 50,
  },
  {
    id: "a2",
    title: "Newton's Laws Lab Report",
    subject: "Physics",
    description:
      "Write a three-page lab report for the pendulum experiment. Include hypothesis, data tables, and error analysis.",
    dueDate: "2026-09-18",
    status: "submitted",
    maxScore: 40,
  },
  {
    id: "a3",
    title: "Essay: Shakespeare's Hamlet",
    subject: "English Literature",
    description:
      "Analyze the theme of madness in Hamlet. 1200 words minimum, with at least three cited primary sources.",
    dueDate: "2026-09-10",
    status: "graded",
    score: 42,
    maxScore: 50,
    feedback:
      "Strong thesis and excellent use of textual evidence. Watch for run-on sentences in section 2.",
  },
  {
    id: "a4",
    title: "Periodic Trends Worksheet",
    subject: "Chemistry",
    description:
      "Complete the atomic-radius and electronegativity graphs, then answer the 8 analysis questions.",
    dueDate: "2026-09-22",
    status: "pending",
    maxScore: 30,
  },
  {
    id: "a5",
    title: "Cell Division Modeling Project",
    subject: "Biology",
    description:
      "Create a physical or digital model showing the stages of mitosis. Prepare a 3-minute presentation.",
    dueDate: "2026-09-14",
    status: "graded",
    score: 27,
    maxScore: 30,
    feedback:
      "Great metaphase and anaphase models. Consider adding more detail for the cytokinesis stage.",
  },
  {
    id: "a6",
    title: "WWII Primary Source Analysis",
    subject: "History",
    description:
      "Compare two primary sources from 1941 and write a 500-word evaluation.",
    dueDate: "2026-09-28",
    status: "pending",
    maxScore: 40,
  },
  {
    id: "a7",
    title: "Python OOP Code Challenges",
    subject: "Computer Science",
    description:
      "Complete 5 object-oriented programming challenges. Include docstrings and unit tests.",
    dueDate: "2026-09-12",
    status: "graded",
    score: 88,
    maxScore: 100,
    feedback:
      "Clean, readable code. Good test coverage. Challenge 3 was missing inheritance from the abstract class.",
  },
  {
    id: "a8",
    title: "Spanish Composition: Mi Escuela",
    subject: "Foreign Language",
    description:
      "Write a 300-word composition about your school. Use at least 8 different verbs in the preterite tense.",
    dueDate: "2026-09-25",
    status: "pending",
    maxScore: 25,
  },
];

export function getAssignmentsByStudent(_studentId?: string): MockAssignment[] {
  void _studentId;
  return assignments;
}
