export type MockStudent = {
  id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  rollNumber: string | number;
};

export type MockTeacher = {
  id: string;
  name: string;
  email: string;
  subjects: string[];
};

export type MockParentChild = {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string | number;
};

export type MockParent = {
  id: string;
  name: string;
  email: string;
  children: MockParentChild[];
};

export const mockStudents: MockStudent[] = [];

export const mockTeachers: MockTeacher[] = [];

export const mockParents: MockParent[] = [];

export function getStudentsByClass(
  className: string | number | `${number}`
): MockStudent[] {
  const key = String(className).replace(/\s/g, "").toUpperCase();
  return mockStudents.filter((s) => {
    const classKey = `${s.class}${s.section}`.toUpperCase();
    return classKey === key || s.class === String(className);
  });
}
