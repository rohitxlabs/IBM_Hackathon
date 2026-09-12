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

export const mockStudents: MockStudent[] = [
  {
    id: "s1",
    name: "Alex Johnson",
    email: "alex.j@jinni.edu",
    class: "10",
    section: "A",
    rollNumber: "101",
  },
  {
    id: "s2",
    name: "Priya Sharma",
    email: "priya.s@jinni.edu",
    class: "10",
    section: "A",
    rollNumber: "102",
  },
  {
    id: "s3",
    name: "Marcus Lee",
    email: "marcus.l@jinni.edu",
    class: "10",
    section: "A",
    rollNumber: "103",
  },
  {
    id: "s4",
    name: "Sofia García",
    email: "sofia.g@jinni.edu",
    class: "10",
    section: "A",
    rollNumber: "104",
  },
  {
    id: "s5",
    name: "Ravi Patel",
    email: "ravi.p@jinni.edu",
    class: "10",
    section: "A",
    rollNumber: "105",
  },
  {
    id: "s6",
    name: "Emma Williams",
    email: "emma.w@jinni.edu",
    class: "10",
    section: "B",
    rollNumber: "106",
  },
  {
    id: "s7",
    name: "Hiro Tanaka",
    email: "hiro.t@jinni.edu",
    class: "10",
    section: "B",
    rollNumber: "107",
  },
  {
    id: "s8",
    name: "Amara Diallo",
    email: "amara.d@jinni.edu",
    class: "10",
    section: "B",
    rollNumber: "108",
  },
];

export const mockTeachers: MockTeacher[] = [
  {
    id: "t1",
    name: "Ms. Sarah Thompson",
    email: "s.thompson@jinni.edu",
    subjects: ["Mathematics", "Statistics"],
  },
  {
    id: "t2",
    name: "Mr. David Chen",
    email: "d.chen@jinni.edu",
    subjects: ["Physics"],
  },
  {
    id: "t3",
    name: "Mrs. Aisha Khan",
    email: "a.khan@jinni.edu",
    subjects: ["English Literature"],
  },
  {
    id: "t4",
    name: "Mr. Carlos Mendez",
    email: "c.mendez@jinni.edu",
    subjects: ["Chemistry"],
  },
  {
    id: "t5",
    name: "Dr. Nia Okafor",
    email: "n.okafor@jinni.edu",
    subjects: ["Biology"],
  },
];

export const mockParents: MockParent[] = [
  {
    id: "p1",
    name: "Ms. Jennifer Johnson",
    email: "j.johnson@jinni.edu",
    children: [
      {
        id: "s1",
        name: "Alex Johnson",
        class: "10",
        section: "A",
        rollNumber: "101",
      },
      {
        id: "s-other",
        name: "Lily Johnson",
        class: "8",
        section: "B",
        rollNumber: "811",
      },
    ],
  },
];

export function getStudentsByClass(
  className: string | number | `${number}`
): MockStudent[] {
  const key = String(className).replace(/\s/g, "").toUpperCase();
  return mockStudents.filter((s) => {
    const classKey = `${s.class}${s.section}`.toUpperCase();
    return classKey === key || s.class === String(className);
  });
}
