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

const allCourses: MockCourse[] = [];

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
