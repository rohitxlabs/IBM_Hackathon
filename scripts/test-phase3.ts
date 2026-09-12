/**
 * Phase 3 API tests: subjects, topics, assignments, submissions, grading,
 * exams and results, including the end-to-end teacher → student → grade →
 * parent flow. Run with: npm run test:phase3
 */
import { check, checkStatus, section, summary } from "./lib/api-client";
import { buildFixture, daysFromNow } from "./lib/fixtures";

async function main() {
  const f = await buildFixture();
  const {
    teacher,
    otherTeacher,
    student,
    otherStudent,
    parent,
    strangerParent,
    anon,
    ids,
  } = f;

  section("1. Subjects");

  const anonSubjects = await anon.get("/api/subjects");
  checkStatus("anonymous subject list is 401", anonSubjects, 401);

  const studentCreatesSubject = await student.post("/api/subjects", {
    name: "Hacked",
    code: `HACK${f.suffix}`,
  });
  checkStatus("students cannot create subjects", studentCreatesSubject, 403);

  const subjectRes = await teacher.post("/api/subjects", {
    name: "Mathematics",
    code: `MATH${f.suffix}`,
    description: "Grade 9 mathematics",
    classId: ids.classId,
  });
  checkStatus("teacher creates a subject", subjectRes, 201);
  const subjectId = subjectRes.body?.data?.subject?.id as string;

  const dupCode = await teacher.post("/api/subjects", {
    name: "Duplicate",
    code: `MATH${f.suffix}`,
  });
  checkStatus("duplicate subject code is rejected", dupCode, 409);

  const foreignClassSubject = await otherTeacher.post("/api/subjects", {
    name: "Intruder",
    code: `INTR${f.suffix}`,
    classId: ids.classId,
  });
  checkStatus(
    "teacher cannot attach a subject to another teacher's class",
    foreignClassSubject,
    403,
  );

  const studentSubjects = await student.get("/api/subjects");
  check(
    "enrolled student sees the class subject",
    studentSubjects.body?.data?.subjects?.some((s: any) => s.id === subjectId),
  );

  const outsiderSubjects = await otherStudent.get("/api/subjects");
  check(
    "student in another class does not see it",
    !outsiderSubjects.body?.data?.subjects?.some((s: any) => s.id === subjectId),
  );

  const foreignUpdate = await otherTeacher.patch(`/api/subjects/${subjectId}`, {
    name: "Hijacked",
  });
  checkStatus("only the owner can update a subject", foreignUpdate, 403);

  const rename = await teacher.patch(`/api/subjects/${subjectId}`, {
    description: "Updated description",
  });
  checkStatus("owner updates the subject", rename, 200);

  section("2. Topics");

  const topicRes = await teacher.post("/api/topics", {
    subjectId,
    name: "Quadratic Equations",
    description: "Roots and the discriminant",
    orderIndex: 1,
  });
  checkStatus("teacher creates a topic", topicRes, 201);
  const topicId = topicRes.body?.data?.topic?.id as string;

  const dupTopic = await teacher.post("/api/topics", {
    subjectId,
    name: "Quadratic Equations",
  });
  checkStatus("duplicate topic name in a subject is rejected", dupTopic, 409);

  const studentTopic = await student.post("/api/topics", {
    subjectId,
    name: "Student Topic",
  });
  checkStatus("students cannot create topics", studentTopic, 403);

  const topicList = await student.get(`/api/topics?subjectId=${subjectId}`);
  check(
    "student lists topics of their subject",
    topicList.body?.data?.topics?.some((t: any) => t.id === topicId),
  );

  const outsiderTopics = await otherStudent.get(
    `/api/topics?subjectId=${subjectId}`,
  );
  checkStatus(
    "student outside the class cannot list its topics",
    outsiderTopics,
    403,
  );

  const secondTopic = await teacher.post("/api/topics", {
    subjectId,
    name: "Linear Equations",
    orderIndex: 0,
  });
  const secondTopicId = secondTopic.body?.data?.topic?.id as string;

  const topicDelete = await teacher.delete(`/api/topics/${secondTopicId}`);
  checkStatus("owner deletes a topic", topicDelete, 200);

  section("3. Assignments — teacher side");

  const studentCreates = await student.post("/api/assignments", {
    title: "Fake assignment",
    description: "x",
    classId: ids.classId,
    subjectId,
    dueDate: daysFromNow(3),
  });
  checkStatus("students cannot create assignments", studentCreates, 403);

  const badDue = await teacher.post("/api/assignments", {
    title: "Bad date",
    description: "x",
    classId: ids.classId,
    subjectId,
    dueDate: "not-a-date",
  });
  checkStatus("an invalid due date is rejected", badDue, 422);

  const foreignClassAssignment = await otherTeacher.post("/api/assignments", {
    title: "Intruder",
    description: "x",
    classId: ids.classId,
    subjectId,
    dueDate: daysFromNow(3),
  });
  checkStatus(
    "teacher cannot create work in another teacher's class",
    foreignClassAssignment,
    403,
  );

  const assignmentRes = await teacher.post("/api/assignments", {
    title: "Quadratic Roots Worksheet",
    description: "Solve the ten equations and show your working.",
    classId: ids.classId,
    subjectId,
    topicId,
    dueDate: daysFromNow(5),
    maxScore: 40,
  });
  checkStatus("teacher creates an assignment", assignmentRes, 201);
  const assignmentId = assignmentRes.body?.data?.assignment?.id as string;

  const draftRes = await teacher.post("/api/assignments", {
    title: "Unpublished draft",
    description: "Not visible yet.",
    classId: ids.classId,
    subjectId,
    dueDate: daysFromNow(9),
    isPublished: false,
  });
  const draftId = draftRes.body?.data?.assignment?.id as string;

  section("4. Assignments — student and parent visibility");

  const studentList = await student.get("/api/assignments");
  check(
    "student sees the published assignment",
    studentList.body?.data?.assignments?.some((a: any) => a.id === assignmentId),
  );
  check(
    "student does not see the unpublished draft",
    !studentList.body?.data?.assignments?.some((a: any) => a.id === draftId),
  );
  check(
    "an unsubmitted assignment reads as PENDING",
    studentList.body?.data?.assignments?.find((a: any) => a.id === assignmentId)
      ?.status === "PENDING",
  );

  const draftDetail = await student.get(`/api/assignments/${draftId}`);
  checkStatus("student cannot open the draft directly", draftDetail, 404);

  const outsiderDetail = await otherStudent.get(
    `/api/assignments/${assignmentId}`,
  );
  checkStatus(
    "student in another class cannot open it",
    outsiderDetail,
    403,
  );

  const parentList = await parent.get(
    `/api/assignments?studentId=${ids.studentId}`,
  );
  check(
    "parent sees their child's assignment",
    parentList.body?.data?.assignments?.some((a: any) => a.id === assignmentId),
  );

  const strangerList = await strangerParent.get(
    `/api/assignments?studentId=${ids.studentId}`,
  );
  checkStatus(
    "unrelated parent cannot query that student",
    strangerList,
    403,
  );

  section("5. Submission and grading flow");

  const outsiderSubmit = await otherStudent.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "Not my class" },
  );
  checkStatus(
    "student outside the class cannot submit",
    outsiderSubmit,
    403,
  );

  const emptySubmit = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    {},
  );
  checkStatus("an empty submission is rejected", emptySubmit, 422);

  const submitRes = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "Answers for questions 1 to 10." },
  );
  checkStatus("student submits the assignment", submitRes, 201);
  const submissionId = submitRes.body?.data?.submission?.id as string;
  check(
    "submission is marked SUBMITTED before the due date",
    submitRes.body?.data?.submission?.status === "SUBMITTED",
  );

  const resubmit = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "Revised answers." },
  );
  checkStatus("student may revise before grading", resubmit, 201);

  const teacherView = await teacher.get(
    `/api/assignments/${assignmentId}/submissions`,
  );
  checkStatus("teacher lists submissions", teacherView, 200);
  check(
    "submission list includes the student",
    teacherView.body?.data?.submissions?.some(
      (s: any) => s.studentId === ids.studentId,
    ),
  );
  check(
    "submission stats report one of one submitted",
    teacherView.body?.data?.stats?.submitted === 1,
  );

  const foreignGrade = await otherTeacher.post(
    `/api/submissions/${submissionId}/grade`,
    { score: 40 },
  );
  checkStatus("another teacher cannot grade it", foreignGrade, 403);

  const studentGrade = await student.post(
    `/api/submissions/${submissionId}/grade`,
    { score: 40 },
  );
  checkStatus("a student cannot grade their own work", studentGrade, 403);

  const overMax = await teacher.post(`/api/submissions/${submissionId}/grade`, {
    score: 500,
  });
  checkStatus("a score above the maximum is rejected", overMax, 400);

  const gradeRes = await teacher.post(
    `/api/submissions/${submissionId}/grade`,
    { score: 34, feedback: "Good work. Watch the discriminant sign in Q7." },
  );
  checkStatus("teacher grades the submission", gradeRes, 200);
  check(
    "graded submission carries the score",
    gradeRes.body?.data?.submission?.score === 34 &&
      gradeRes.body?.data?.submission?.status === "GRADED",
  );

  const lateEdit = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "Trying to change a graded answer." },
  );
  checkStatus("a graded submission cannot be changed", lateEdit, 409);

  const studentSeesGrade = await student.get(
    `/api/assignments/${assignmentId}`,
  );
  check(
    "student sees their grade and feedback",
    studentSeesGrade.body?.data?.assignment?.submission?.score === 34 &&
      typeof studentSeesGrade.body?.data?.assignment?.submission?.feedback ===
        "string",
  );

  const parentSeesGrade = await parent.get(
    `/api/assignments/${assignmentId}/submissions?studentId=${ids.studentId}`,
  );
  check(
    "parent sees the child's grade",
    parentSeesGrade.status === 200 &&
      parentSeesGrade.body?.data?.submission?.score === 34,
  );

  const strangerSeesGrade = await strangerParent.get(
    `/api/assignments/${assignmentId}/submissions?studentId=${ids.studentId}`,
  );
  checkStatus(
    "unrelated parent cannot see the grade",
    strangerSeesGrade,
    403,
  );

  const peerSeesGrade = await otherStudent.get(
    `/api/assignments/${assignmentId}/submissions?studentId=${ids.studentId}`,
  );
  checkStatus("another student cannot see the grade", peerSeesGrade, 403);

  const statusFilter = await student.get("/api/assignments?status=GRADED");
  check(
    "status filter returns the graded assignment",
    statusFilter.body?.data?.assignments?.some(
      (a: any) => a.id === assignmentId,
    ),
  );

  section("6. Exams");

  const studentCreatesExam = await student.post("/api/exams", {
    title: "Fake exam",
    classId: ids.classId,
    subjectId,
    examDate: daysFromNow(10),
  });
  checkStatus("students cannot create exams", studentCreatesExam, 403);

  const upcomingRes = await teacher.post("/api/exams", {
    title: "Coordinate Geometry Quiz",
    classId: ids.classId,
    subjectId,
    examType: "QUIZ",
    examDate: daysFromNow(12),
    durationMinutes: 30,
    maxScore: 20,
  });
  checkStatus("teacher creates an upcoming exam", upcomingRes, 201);
  const upcomingExamId = upcomingRes.body?.data?.exam?.id as string;

  const pastRes = await teacher.post("/api/exams", {
    title: "Mathematics Midterm",
    classId: ids.classId,
    subjectId,
    examType: "MIDTERM",
    examDate: daysFromNow(-10),
    maxScore: 100,
  });
  const pastExamId = pastRes.body?.data?.exam?.id as string;

  const upcoming = await student.get("/api/exams?scope=UPCOMING");
  check(
    "student sees the upcoming exam",
    upcoming.body?.data?.exams?.some((e: any) => e.id === upcomingExamId),
  );
  check(
    "past exams are excluded from the upcoming scope",
    !upcoming.body?.data?.exams?.some((e: any) => e.id === pastExamId),
  );

  const outsiderExams = await otherStudent.get("/api/exams");
  check(
    "student in another class does not see these exams",
    !outsiderExams.body?.data?.exams?.some((e: any) => e.id === upcomingExamId),
  );

  const foreignExamUpdate = await otherTeacher.patch(
    `/api/exams/${upcomingExamId}`,
    { title: "Hijacked" },
  );
  checkStatus("another teacher cannot update the exam", foreignExamUpdate, 403);

  section("7. Exam results");

  const studentRecords = await student.post(`/api/exams/${pastExamId}/results`, {
    results: [{ studentId: ids.studentId, score: 100 }],
  });
  checkStatus("students cannot record results", studentRecords, 403);

  const outsiderResult = await teacher.post(
    `/api/exams/${pastExamId}/results`,
    { results: [{ studentId: ids.otherStudentId, score: 50 }] },
  );
  checkStatus(
    "a student outside the class cannot be given a result",
    outsiderResult,
    400,
  );

  const overMaxResult = await teacher.post(
    `/api/exams/${pastExamId}/results`,
    { results: [{ studentId: ids.studentId, score: 500 }] },
  );
  checkStatus("a result above the maximum is rejected", overMaxResult, 400);

  const recordRes = await teacher.post(`/api/exams/${pastExamId}/results`, {
    results: [
      {
        studentId: ids.studentId,
        score: 82,
        grade: "A",
        remarks: "Strong on linear equations.",
      },
    ],
  });
  checkStatus("teacher records an exam result", recordRes, 201);

  const updateResult = await teacher.post(`/api/exams/${pastExamId}/results`, {
    results: [{ studentId: ids.studentId, score: 85, grade: "A" }],
  });
  checkStatus("recording again updates the result", updateResult, 201);

  const studentResult = await student.get(`/api/exams/${pastExamId}`);
  check(
    "student sees their own exam result",
    studentResult.body?.data?.exam?.result?.score === 85,
  );

  const parentResults = await parent.get(
    `/api/results?studentId=${ids.studentId}`,
  );
  check(
    "parent sees the child's exam result",
    parentResults.body?.data?.results?.some(
      (r: any) => r.examId === pastExamId && r.score === 85,
    ),
  );

  const strangerResults = await strangerParent.get(
    `/api/results?studentId=${ids.studentId}`,
  );
  checkStatus(
    "unrelated parent cannot query those results",
    strangerResults,
    403,
  );

  const peerResults = await otherStudent.get(
    `/api/exams/${pastExamId}/results`,
  );
  checkStatus(
    "student outside the class cannot read the results",
    peerResults,
    403,
  );

  const ownResults = await student.get("/api/results");
  check(
    "student lists only their own results",
    ownResults.body?.data?.results?.every(
      (r: any) => r.studentId === ids.studentId,
    ),
  );

  const teacherResults = await teacher.get(
    `/api/exams/${pastExamId}/results`,
  );
  check(
    "teacher sees the class results",
    teacherResults.body?.data?.results?.length >= 1,
  );

  section("8. Deletion rules");

  const subjectInUse = await teacher.delete(`/api/subjects/${subjectId}`);
  checkStatus(
    "a subject with assignments cannot be deleted",
    subjectInUse,
    409,
  );

  const deleteExam = await teacher.delete(`/api/exams/${upcomingExamId}`);
  checkStatus("teacher deletes their exam", deleteExam, 200);

  const deleteAssignment = await teacher.delete(
    `/api/assignments/${draftId}`,
  );
  checkStatus("teacher deletes their draft assignment", deleteAssignment, 200);

  summary("Phase 3");
}

main().catch((error) => {
  console.error("Phase 3 test run crashed:", error);
  process.exitCode = 1;
});
