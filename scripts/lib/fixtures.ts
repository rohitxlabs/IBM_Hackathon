/** Builds a fresh, isolated set of accounts and a class for a test run. */
import { Client, uniqueSuffix } from "./api-client";

export const PASSWORD = "TestPass123";

export interface Fixture {
  suffix: string;
  teacher: Client;
  otherTeacher: Client;
  student: Client;
  otherStudent: Client;
  parent: Client;
  strangerParent: Client;
  anon: Client;
  ids: {
    teacherId: string;
    otherTeacherId: string;
    studentId: string;
    otherStudentId: string;
    parentId: string;
    strangerParentId: string;
    classId: string;
    otherClassId: string;
  };
  emails: Record<string, string>;
  rolls: { student: string; otherStudent: string };
}

async function register(client: Client, body: Record<string, unknown>) {
  const res = await client.post("/api/auth/register", body);
  if (res.status !== 201) {
    throw new Error(
      `fixture registration failed (${res.status}): ${JSON.stringify(res.body)}`,
    );
  }
  return res.body.data.user;
}

/**
 * Creates two teachers with a class each, two students (one enrolled in the
 * first class), a parent linked to the enrolled student, and an unrelated
 * parent used to prove that access is denied.
 */
export async function buildFixture(): Promise<Fixture> {
  const suffix = uniqueSuffix();

  const teacher = new Client("teacher");
  const otherTeacher = new Client("otherTeacher");
  const student = new Client("student");
  const otherStudent = new Client("otherStudent");
  const parent = new Client("parent");
  const strangerParent = new Client("strangerParent");
  const anon = new Client("anon");

  const emails = {
    teacher: `t.${suffix}@jinni.test`,
    otherTeacher: `t2.${suffix}@jinni.test`,
    student: `s.${suffix}@jinni.test`,
    otherStudent: `s2.${suffix}@jinni.test`,
    parent: `p.${suffix}@jinni.test`,
    strangerParent: `p2.${suffix}@jinni.test`,
  };

  const rolls = {
    student: `R-${suffix}-1`,
    otherStudent: `R-${suffix}-2`,
  };

  const t1 = await register(teacher, {
    email: emails.teacher,
    password: PASSWORD,
    name: "Fixture Teacher",
    role: "TEACHER",
    employeeId: `EMP-${suffix}-1`,
    department: "Mathematics",
  });

  const t2 = await register(otherTeacher, {
    email: emails.otherTeacher,
    password: PASSWORD,
    name: "Fixture Other Teacher",
    role: "TEACHER",
    employeeId: `EMP-${suffix}-2`,
  });

  const s1 = await register(student, {
    email: emails.student,
    password: PASSWORD,
    name: "Fixture Student",
    role: "STUDENT",
    rollNumber: rolls.student,
    gradeLevel: 9,
  });

  const s2 = await register(otherStudent, {
    email: emails.otherStudent,
    password: PASSWORD,
    name: "Fixture Other Student",
    role: "STUDENT",
    rollNumber: rolls.otherStudent,
    gradeLevel: 9,
  });

  const p1 = await register(parent, {
    email: emails.parent,
    password: PASSWORD,
    name: "Fixture Parent",
    role: "PARENT",
  });

  const p2 = await register(strangerParent, {
    email: emails.strangerParent,
    password: PASSWORD,
    name: "Fixture Stranger Parent",
    role: "PARENT",
  });

  const classRes = await teacher.post("/api/classes", {
    name: `Grade 9 ${suffix}`,
    section: "A",
    academicYear: "2025-2026",
    gradeLevel: 9,
  });

  const otherClassRes = await otherTeacher.post("/api/classes", {
    name: `Grade 9 ${suffix}`,
    section: "B",
    academicYear: "2025-2026",
    gradeLevel: 9,
  });

  const classId = classRes.body.data.class.id as string;
  const otherClassId = otherClassRes.body.data.class.id as string;

  await teacher.post(`/api/classes/${classId}/students`, {
    studentId: s1.studentId,
  });

  await otherTeacher.post(`/api/classes/${otherClassId}/students`, {
    studentId: s2.studentId,
  });

  await parent.post(`/api/parents/${p1.parentId}/children`, {
    rollNumber: rolls.student,
    studentEmail: emails.student,
    relationship: "MOTHER",
    isPrimary: true,
  });

  return {
    suffix,
    teacher,
    otherTeacher,
    student,
    otherStudent,
    parent,
    strangerParent,
    anon,
    ids: {
      teacherId: t1.teacherId,
      otherTeacherId: t2.teacherId,
      studentId: s1.studentId,
      otherStudentId: s2.studentId,
      parentId: p1.parentId,
      strangerParentId: p2.parentId,
      classId,
      otherClassId,
    },
    emails,
    rolls,
  };
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
