import type { Course } from "../types";

export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Mathematics",
    subject: "Mathematics",
    teacher: "Mrs. Sarah Smith",
    teacherId: "t1",
    class: "10A",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    room: "Room 101",
    color: "bg-primary-500",
  },
  {
    id: "c2",
    name: "Physics",
    subject: "Physics",
    teacher: "Mrs. Sarah Smith",
    teacherId: "t1",
    class: "10A",
    schedule: "Tue, Thu - 10:00 AM",
    room: "Room 102",
    color: "bg-secondary-500",
  },
  {
    id: "c3",
    name: "English",
    subject: "English",
    teacher: "Mr. James Wilson",
    teacherId: "t2",
    class: "10A",
    schedule: "Mon, Wed, Fri - 11:00 AM",
    room: "Room 103",
    color: "bg-accent-500",
  },
  {
    id: "c4",
    name: "Chemistry",
    subject: "Chemistry",
    teacher: "Dr. Emily Chen",
    teacherId: "t3",
    class: "10A",
    schedule: "Tue, Thu - 2:00 PM",
    room: "Lab 1",
    color: "bg-success-500",
  },
  {
    id: "c5",
    name: "History",
    subject: "History",
    teacher: "Mr. James Wilson",
    teacherId: "t2",
    class: "10A",
    schedule: "Wed, Fri - 2:00 PM",
    room: "Room 104",
    color: "bg-warning-500",
  },
  {
    id: "c6",
    name: "Biology",
    subject: "Biology",
    teacher: "Dr. Emily Chen",
    teacherId: "t3",
    class: "10A",
    schedule: "Mon, Thu - 3:00 PM",
    room: "Lab 2",
    color: "bg-danger-500",
  },
];

export function getCoursesByClass(className: string): Course[] {
  return mockCourses.filter((c) => c.class === className);
}

export function getCoursesByTeacher(teacherId: string): Course[] {
  return mockCourses.filter((c) => c.teacherId === teacherId);
}

export function getCourseById(id: string): Course | undefined {
  return mockCourses.find((c) => c.id === id);
}
