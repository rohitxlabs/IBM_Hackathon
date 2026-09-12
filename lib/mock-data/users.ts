import type { Student, Teacher, Parent } from "../types";

export const mockStudents: Student[] = [
  {
    id: "s1",
    name: "Alex Johnson",
    email: "alex@school.edu",
    role: "student",
    class: "10",
    section: "A",
    rollNumber: "10A01",
    parentId: "p1",
  },
  {
    id: "s2",
    name: "Emma Williams",
    email: "emma@school.edu",
    role: "student",
    class: "10",
    section: "A",
    rollNumber: "10A02",
    parentId: "p1",
  },
  {
    id: "s3",
    name: "Liam Brown",
    email: "liam@school.edu",
    role: "student",
    class: "10",
    section: "B",
    rollNumber: "10B01",
    parentId: "p2",
  },
  {
    id: "s4",
    name: "Olivia Davis",
    email: "olivia@school.edu",
    role: "student",
    class: "10",
    section: "B",
    rollNumber: "10B02",
    parentId: "p2",
  },
  {
    id: "s5",
    name: "Noah Wilson",
    email: "noah@school.edu",
    role: "student",
    class: "10",
    section: "A",
    rollNumber: "10A03",
    parentId: "p3",
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: "t1",
    name: "Mrs. Sarah Smith",
    email: "sarah.smith@school.edu",
    role: "teacher",
    subjects: ["Mathematics", "Physics"],
    classes: ["10A", "10B", "9A"],
  },
  {
    id: "t2",
    name: "Mr. James Wilson",
    email: "james.wilson@school.edu",
    role: "teacher",
    subjects: ["English", "History"],
    classes: ["10A", "10B", "9B"],
  },
  {
    id: "t3",
    name: "Dr. Emily Chen",
    email: "emily.chen@school.edu",
    role: "teacher",
    subjects: ["Chemistry", "Biology"],
    classes: ["10A", "10B", "11A"],
  },
];

export const mockParents: Parent[] = [
  {
    id: "p1",
    name: "Robert Johnson",
    email: "robert.johnson@email.com",
    role: "parent",
    children: [mockStudents[0], mockStudents[1]],
  },
  {
    id: "p2",
    name: "Jennifer Brown",
    email: "jennifer.brown@email.com",
    role: "parent",
    children: [mockStudents[2], mockStudents[3]],
  },
  {
    id: "p3",
    name: "Michael Wilson",
    email: "michael.wilson@email.com",
    role: "parent",
    children: [mockStudents[4]],
  },
];

export function getStudentById(id: string): Student | undefined {
  return mockStudents.find((s) => s.id === id);
}

export function getTeacherById(id: string): Teacher | undefined {
  return mockTeachers.find((t) => t.id === id);
}

export function getParentById(id: string): Parent | undefined {
  return mockParents.find((p) => p.id === id);
}

export function getStudentsByClass(className: string): Student[] {
  return mockStudents.filter(
    (s) => `${s.class}${s.section}` === className
  );
}

export function getChildrenByParentId(parentId: string): Student[] {
  const parent = mockParents.find((p) => p.id === parentId);
  return parent?.children || [];
}
