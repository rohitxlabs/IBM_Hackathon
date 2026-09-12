/**
 * Phase 2 API tests: authentication, profiles, parent-child linking, classes
 * and the role-based authorization rules around them.
 *
 * Requires the dev server to be running. Run with: npm run test:phase2
 */
import {
  Client,
  check,
  checkStatus,
  section,
  summary,
  uniqueSuffix,
} from "./lib/api-client";

const s = uniqueSuffix();
const PASSWORD = "TestPass123";

const teacher = new Client("teacher");
const otherTeacher = new Client("otherTeacher");
const student = new Client("student");
const otherStudent = new Client("otherStudent");
const parent = new Client("parent");
const strangerParent = new Client("strangerParent");
const anon = new Client("anon");

const emails = {
  teacher: `t.${s}@jinni.test`,
  otherTeacher: `t2.${s}@jinni.test`,
  student: `s.${s}@jinni.test`,
  otherStudent: `s2.${s}@jinni.test`,
  parent: `p.${s}@jinni.test`,
  strangerParent: `p2.${s}@jinni.test`,
};

const rolls = { student: `R-${s}-1`, otherStudent: `R-${s}-2` };

async function main() {
  section("1. Registration and validation");

  const weak = await anon.post("/api/auth/register", {
    email: `weak.${s}@jinni.test`,
    password: "short",
    name: "Weak Password",
    role: "STUDENT",
    rollNumber: `R-${s}-x`,
    gradeLevel: 9,
  });
  checkStatus("weak password is rejected", weak, 422);

  const badRole = await anon.post("/api/auth/register", {
    email: `bad.${s}@jinni.test`,
    password: PASSWORD,
    name: "Bad Role",
    role: "ADMIN",
  });
  checkStatus("unknown role is rejected", badRole, 422);

  const missingProfile = await anon.post("/api/auth/register", {
    email: `np.${s}@jinni.test`,
    password: PASSWORD,
    name: "No Roll Number",
    role: "STUDENT",
    gradeLevel: 9,
  });
  checkStatus("student without a roll number is rejected", missingProfile, 422);

  const teacherReg = await teacher.post("/api/auth/register", {
    email: emails.teacher,
    password: PASSWORD,
    name: "Test Teacher",
    role: "TEACHER",
    employeeId: `EMP-${s}-1`,
    department: "Mathematics",
  });
  checkStatus("teacher registers", teacherReg, 201);
  const teacherId = teacherReg.body?.data?.user?.teacherId as string;
  check("registration returns a teacher profile id", Boolean(teacherId));
  check(
    "registration response omits the password hash",
    !JSON.stringify(teacherReg.body).toLowerCase().includes("passwordhash"),
  );
  check("registration sets a session cookie", teacher.hasCookie());

  const teacher2Reg = await otherTeacher.post("/api/auth/register", {
    email: emails.otherTeacher,
    password: PASSWORD,
    name: "Other Teacher",
    role: "TEACHER",
    employeeId: `EMP-${s}-2`,
  });
  checkStatus("second teacher registers", teacher2Reg, 201);

  const studentReg = await student.post("/api/auth/register", {
    email: emails.student,
    password: PASSWORD,
    name: "Test Student",
    role: "STUDENT",
    rollNumber: rolls.student,
    gradeLevel: 9,
  });
  checkStatus("student registers", studentReg, 201);
  const studentId = studentReg.body?.data?.user?.studentId as string;

  const student2Reg = await otherStudent.post("/api/auth/register", {
    email: emails.otherStudent,
    password: PASSWORD,
    name: "Other Student",
    role: "STUDENT",
    rollNumber: rolls.otherStudent,
    gradeLevel: 9,
  });
  checkStatus("second student registers", student2Reg, 201);
  const otherStudentId = student2Reg.body?.data?.user?.studentId as string;

  const parentReg = await parent.post("/api/auth/register", {
    email: emails.parent,
    password: PASSWORD,
    name: "Test Parent",
    role: "PARENT",
    phone: "+91-90000-00001",
  });
  checkStatus("parent registers", parentReg, 201);
  const parentId = parentReg.body?.data?.user?.parentId as string;

  const parent2Reg = await strangerParent.post("/api/auth/register", {
    email: emails.strangerParent,
    password: PASSWORD,
    name: "Stranger Parent",
    role: "PARENT",
  });
  checkStatus("unrelated parent registers", parent2Reg, 201);
  const strangerParentId = parent2Reg.body?.data?.user?.parentId as string;

  const duplicate = await anon.post("/api/auth/register", {
    email: emails.teacher,
    password: PASSWORD,
    name: "Duplicate",
    role: "TEACHER",
    employeeId: `EMP-${s}-9`,
  });
  checkStatus("duplicate email is rejected", duplicate, 409);

  section("2. Login, current user, logout");

  const me = await teacher.get("/api/auth/me");
  checkStatus("authenticated user reads /api/auth/me", me, 200);
  check(
    "/api/auth/me returns the right account",
    me.body?.data?.user?.email === emails.teacher,
  );

  const anonMe = await anon.get("/api/auth/me");
  checkStatus("anonymous /api/auth/me is 401", anonMe, 401);

  const badLogin = await anon.post("/api/auth/login", {
    email: emails.teacher,
    password: "WrongPass123",
  });
  checkStatus("wrong password is rejected", badLogin, 401);

  const unknownLogin = await anon.post("/api/auth/login", {
    email: `nobody.${s}@jinni.test`,
    password: PASSWORD,
  });
  checkStatus("unknown email is rejected", unknownLogin, 401);
  check(
    "login failure does not reveal whether the email exists",
    JSON.stringify(badLogin.body) === JSON.stringify(unknownLogin.body),
  );

  const relogin = new Client("relogin");
  const goodLogin = await relogin.post("/api/auth/login", {
    email: emails.student,
    password: PASSWORD,
  });
  checkStatus("valid credentials log in", goodLogin, 200);
  check("login sets a session cookie", relogin.hasCookie());

  const afterLogin = await relogin.get("/api/auth/me");
  check(
    "session cookie authenticates later requests",
    afterLogin.status === 200 &&
      afterLogin.body?.data?.user?.email === emails.student,
  );

  await relogin.post("/api/auth/logout");
  const afterLogout = await relogin.get("/api/auth/me");
  checkStatus("logout ends the session", afterLogout, 401);

  const tampered = new Client("tampered");
  const tamperedMe = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:3000"}/api/auth/me`,
    { headers: { cookie: "jinni_session=not.a.real.token" } },
  );
  check("a forged session cookie is rejected", tamperedMe.status === 401);
  void tampered;

  section("3. Class management and role restrictions");

  const anonClasses = await anon.get("/api/classes");
  checkStatus("anonymous class list is 401", anonClasses, 401);

  const studentCreate = await student.post("/api/classes", {
    name: `Grade 9 ${s}`,
    section: "Z",
    academicYear: "2025-2026",
    gradeLevel: 9,
  });
  checkStatus("students cannot create classes", studentCreate, 403);

  const created = await teacher.post("/api/classes", {
    name: `Grade 9 ${s}`,
    section: "A",
    academicYear: "2025-2026",
    gradeLevel: 9,
  });
  checkStatus("teacher creates a class", created, 201);
  const classId = created.body?.data?.class?.id as string;

  const dupClass = await teacher.post("/api/classes", {
    name: `Grade 9 ${s}`,
    section: "A",
    academicYear: "2025-2026",
    gradeLevel: 9,
  });
  checkStatus("duplicate class is rejected", dupClass, 409);

  const badYear = await teacher.post("/api/classes", {
    name: `Grade 9 ${s}`,
    section: "B",
    academicYear: "2025",
    gradeLevel: 9,
  });
  checkStatus("malformed academic year is rejected", badYear, 422);

  const teacherClasses = await teacher.get("/api/classes");
  check(
    "teacher sees their own class",
    teacherClasses.body?.data?.classes?.some((c: any) => c.id === classId),
  );

  const otherTeacherClasses = await otherTeacher.get("/api/classes");
  check(
    "another teacher does not see that class",
    !otherTeacherClasses.body?.data?.classes?.some((c: any) => c.id === classId),
  );

  const foreignView = await otherTeacher.get(`/api/classes/${classId}`);
  checkStatus("unrelated teacher cannot view the class", foreignView, 403);

  const foreignUpdate = await otherTeacher.patch(`/api/classes/${classId}`, {
    section: "C",
  });
  checkStatus("unrelated teacher cannot update the class", foreignUpdate, 403);

  const foreignDelete = await otherTeacher.delete(`/api/classes/${classId}`);
  checkStatus("unrelated teacher cannot delete the class", foreignDelete, 403);

  section("4. Enrolment");

  const beforeEnrol = await student.get(`/api/classes/${classId}`);
  checkStatus("student cannot view a class before enrolment", beforeEnrol, 403);

  const enrol = await teacher.post(`/api/classes/${classId}/students`, {
    rollNumber: rolls.student,
  });
  checkStatus("teacher enrols a student by roll number", enrol, 201);

  const dupEnrol = await teacher.post(`/api/classes/${classId}/students`, {
    studentId,
  });
  checkStatus("duplicate enrolment is rejected", dupEnrol, 409);

  const studentEnrols = await student.post(`/api/classes/${classId}/students`, {
    studentId: otherStudentId,
  });
  checkStatus("a student cannot enrol anyone", studentEnrols, 403);

  const afterEnrol = await student.get(`/api/classes/${classId}`);
  checkStatus("enrolled student can view the class", afterEnrol, 200);

  const notEnrolled = await otherStudent.get(`/api/classes/${classId}`);
  checkStatus("non-enrolled student cannot view the class", notEnrolled, 403);

  const roster = await teacher.get(`/api/classes/${classId}/students`);
  check(
    "roster contains the enrolled student",
    roster.body?.data?.students?.some((e: any) => e.student.id === studentId),
  );

  section("5. Profiles");

  const selfProfile = await student.get(`/api/students/${studentId}`);
  checkStatus("student reads their own profile", selfProfile, 200);

  const peerProfile = await otherStudent.get(`/api/students/${studentId}`);
  checkStatus("student cannot read another student", peerProfile, 403);

  const teacherReadsStudent = await teacher.get(`/api/students/${studentId}`);
  checkStatus(
    "teacher reads a student in their own class",
    teacherReadsStudent,
    200,
  );

  const foreignTeacherReadsStudent = await otherTeacher.get(
    `/api/students/${studentId}`,
  );
  checkStatus(
    "teacher cannot read a student outside their classes",
    foreignTeacherReadsStudent,
    403,
  );

  const selfUpdate = await student.patch(`/api/students/${studentId}`, {
    name: "Renamed Student",
  });
  checkStatus("student updates their own profile", selfUpdate, 200);

  const peerUpdate = await otherStudent.patch(`/api/students/${studentId}`, {
    name: "Hijacked",
  });
  checkStatus("student cannot update another profile", peerUpdate, 403);

  const unknownField = await student.patch(`/api/students/${studentId}`, {
    rollNumber: "HACK-1",
  });
  checkStatus("unknown profile fields are rejected", unknownField, 422);

  section("6. Parent-child linking and access");

  const wrongEmailLink = await parent.post(
    `/api/parents/${parentId}/children`,
    { rollNumber: rolls.student, studentEmail: emails.otherStudent },
  );
  checkStatus("linking with a mismatched email fails", wrongEmailLink, 404);

  const link = await parent.post(`/api/parents/${parentId}/children`, {
    rollNumber: rolls.student,
    studentEmail: emails.student,
    relationship: "MOTHER",
    isPrimary: true,
  });
  checkStatus("parent links their child", link, 201);

  const dupLink = await parent.post(`/api/parents/${parentId}/children`, {
    rollNumber: rolls.student,
    studentEmail: emails.student,
  });
  checkStatus("duplicate link is rejected", dupLink, 409);

  const foreignLink = await strangerParent.post(
    `/api/parents/${parentId}/children`,
    { rollNumber: rolls.student, studentEmail: emails.student },
  );
  checkStatus(
    "a parent cannot add children to another parent's account",
    foreignLink,
    403,
  );

  const children = await parent.get(`/api/parents/${parentId}/children`);
  check(
    "parent lists their linked child",
    children.body?.data?.children?.some((c: any) => c.student.id === studentId),
  );

  const parentReadsChild = await parent.get(`/api/students/${studentId}`);
  checkStatus("parent reads their linked child", parentReadsChild, 200);

  const strangerReadsChild = await strangerParent.get(
    `/api/students/${studentId}`,
  );
  checkStatus(
    "unlinked parent cannot read that student",
    strangerReadsChild,
    403,
  );

  const parentSeesClass = await parent.get(`/api/classes/${classId}`);
  checkStatus("parent views the class their child is in", parentSeesClass, 200);

  const strangerSeesClass = await strangerParent.get(`/api/classes/${classId}`);
  checkStatus(
    "unrelated parent cannot view that class",
    strangerSeesClass,
    403,
  );

  const parentProfileByOther = await strangerParent.get(
    `/api/parents/${parentId}`,
  );
  checkStatus(
    "parent cannot read another parent's profile",
    parentProfileByOther,
    403,
  );

  const teacherReadsParent = await teacher.get(`/api/parents/${parentId}`);
  checkStatus(
    "teacher reads the parent of their own student",
    teacherReadsParent,
    200,
  );

  section("7. Teacher profile visibility");

  const teacherSelf = await teacher.get(`/api/teachers/${teacherId}`);
  checkStatus("teacher reads their own profile", teacherSelf, 200);
  check(
    "own profile includes the employee id",
    Boolean(teacherSelf.body?.data?.teacher?.employeeId),
  );

  const studentReadsTeacher = await student.get(`/api/teachers/${teacherId}`);
  checkStatus("enrolled student reads their teacher", studentReadsTeacher, 200);
  check(
    "employee id is hidden from students",
    studentReadsTeacher.body?.data?.teacher?.employeeId === undefined,
  );

  const strangerReadsTeacher = await strangerParent.get(
    `/api/teachers/${teacherId}`,
  );
  checkStatus(
    "unrelated parent cannot read the teacher",
    strangerReadsTeacher,
    403,
  );

  const foreignTeacherUpdate = await otherTeacher.patch(
    `/api/teachers/${teacherId}`,
    { department: "Hijacked" },
  );
  checkStatus(
    "teacher cannot update another teacher",
    foreignTeacherUpdate,
    403,
  );

  section("8. Cleanup paths");

  const unlink = await parent.delete(
    `/api/parents/${parentId}/children/${studentId}`,
  );
  checkStatus("parent unlinks a child", unlink, 200);

  const afterUnlink = await parent.get(`/api/students/${studentId}`);
  checkStatus("access ends once the link is removed", afterUnlink, 403);

  const remove = await teacher.delete(
    `/api/classes/${classId}/students/${studentId}`,
  );
  checkStatus("teacher removes a student from the class", remove, 200);

  const removedView = await student.get(`/api/classes/${classId}`);
  checkStatus("removed student loses class access", removedView, 403);

  const del = await teacher.delete(`/api/classes/${classId}`);
  checkStatus("teacher deletes their class", del, 200);

  const gone = await teacher.get(`/api/classes/${classId}`);
  checkStatus("deleted class is no longer readable", gone, 403);

  void strangerParentId;
  void otherStudentId;
  summary("Phase 2");
}

main().catch((error) => {
  console.error("Phase 2 test run crashed:", error);
  process.exitCode = 1;
});
