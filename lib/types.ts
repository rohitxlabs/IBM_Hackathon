// User Types
export type UserRole = "student" | "teacher" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student extends User {
  role: "student";
  class: string;
  section: string;
  rollNumber: string;
  parentId: string;
}

export interface Teacher extends User {
  role: "teacher";
  subjects: string[];
  classes: string[];
}

export interface Parent extends User {
  role: "parent";
  children: Student[];
}

// Academic Types
export interface Course {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  teacherId: string;
  class: string;
  schedule: string;
  room: string;
  color: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  courseId: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  score?: number;
  maxScore: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
}

export interface Grade {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  type: "quiz" | "exam" | "assignment" | "project";
  title: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  subject?: string;
  class?: string;
  remarks?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "assignment" | "grade" | "attendance" | "announcement" | "message";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ClassSchedule {
  id: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room: string;
  day: string;
}

// Analytics Types
export interface PerformanceData {
  month: string;
  score: number;
  attendance: number;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  trend: "up" | "down" | "stable";
}

// AI Types
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalCourses: number;
  pendingAssignments: number;
  attendancePercentage: number;
  averageGrade: number;
  totalStudents?: number;
  classesToday?: number;
}

export interface Activity {
  id: string;
  type: "assignment" | "grade" | "attendance" | "announcement";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
