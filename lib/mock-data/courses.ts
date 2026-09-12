export type MockCourse = {
  id: string;
  name: string;
  subject: string;
  class: string;
  section?: string;
  teacher?: string;
  teacherId?: string;
  schedule: string;
  room: string;
  color: string;
};

const allCourses: MockCourse[] = [
  {
    id: "c1",
    name: "Advanced Algebra",
    subject: "Mathematics",
    class: "10",
    section: "A",
    teacher: "Ms. Sarah Thompson",
    teacherId: "t1",
    schedule: "Mon, Wed, Fri · 09:00 – 09:45",
    room: "Room 204",
    color: "bg-primary-500",
  },
  {
    id: "c2",
    name: "Mechanics & Waves",
    subject: "Physics",
    class: "10",
    section: "A",
    teacher: "Mr. David Chen",
    teacherId: "t2",
    schedule: "Tue, Thu · 10:00 – 10:45",
    room: "Physics Lab 1",
    color: "bg-accent-500",
  },
  {
    id: "c3",
    name: "World Literature",
    subject: "English Literature",
    class: "10",
    section: "A",
    teacher: "Mrs. Aisha Khan",
    teacherId: "t3",
    schedule: "Mon, Thu · 11:00 – 11:45",
    room: "Room 311",
    color: "bg-secondary-500",
  },
  {
    id: "c4",
    name: "General Chemistry",
    subject: "Chemistry",
    class: "10",
    section: "A",
    teacher: "Mr. Carlos Mendez",
    teacherId: "t4",
    schedule: "Wed, Fri · 13:00 – 13:45",
    room: "Chemistry Lab",
    color: "bg-success-500",
  },
  {
    id: "c5",
    name: "Biology",
    subject: "Biology",
    class: "10",
    section: "A",
    teacher: "Dr. Nia Okafor",
    teacherId: "t5",
    schedule: "Tue, Fri · 14:00 – 14:45",
    room: "Bio Lab 2",
    color: "bg-warning-500",
  },
  {
    id: "c6",
    name: "Intro to Python",
    subject: "Computer Science",
    class: "10",
    section: "A",
    teacher: "Mr. David Chen",
    teacherId: "t2",
    schedule: "Mon · 14:00 – 15:30",
    room: "Computer Lab",
    color: "bg-danger-500",
  },
  {
    id: "c7",
    name: "Pre-Calculus",
    subject: "Mathematics",
    class: "9",
    section: "A",
    teacher: "Ms. Sarah Thompson",
    teacherId: "t1",
    schedule: "Mon, Wed, Fri · 08:00 – 08:45",
    room: "Room 202",
    color: "bg-primary-500",
  },
];

export function getCoursesByTeacher(teacherId: string): MockCourse[] {
  return allCourses.filter((c) => c.teacherId === teacherId);
}

export function getCoursesByClass(
  className: string | number | `${number}${string}`
): MockCourse[] {
  const key = String(className).replace(/\s/g, "").toUpperCase();
  return allCourses.filter((c) => {
    const classKey = `${c.class}${c.section ?? ""}`.toUpperCase();
    return classKey === key || c.class === String(className);
  });
}
