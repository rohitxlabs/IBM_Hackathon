/**
 * Phase 5 API tests: parent-teacher messaging, notifications, the three role
 * dashboards and derived progress. Run with: npm run test:phase5
 */
import { check, checkStatus, section, summary } from "./lib/api-client";
import { buildFixture, daysFromNow } from "./lib/fixtures";
import { Client } from "./lib/api-client";

async function main() {
  const f = await buildFixture();
  const { teacher, otherTeacher, student, parent, strangerParent, anon, ids } = f;

  // Academic data for the dashboards to summarise.
  const subjectRes = await teacher.post("/api/subjects", {
    name: "Mathematics",
    code: `MATH${f.suffix}`,
    classId: ids.classId,
  });
  const subjectId = subjectRes.body.data.subject.id as string;

  const topicRes = await teacher.post("/api/topics", {
    subjectId,
    name: "Quadratic Equations",
  });
  const topicId = topicRes.body.data.topic.id as string;

  const assignmentRes = await teacher.post("/api/assignments", {
    title: "Quadratics worksheet",
    description: "Ten questions.",
    classId: ids.classId,
    subjectId,
    topicId,
    dueDate: daysFromNow(4),
    maxScore: 50,
  });
  const assignmentId = assignmentRes.body.data.assignment.id as string;

  section("1. Notifications from academic events");

  const studentNotifications = await student.get("/api/notifications");
  checkStatus("student reads notifications", studentNotifications, 200);
  check(
    "creating an assignment notifies the student",
    studentNotifications.body?.data?.notifications?.some(
      (n: any) => n.type === "ASSIGNMENT" && n.title.includes("Quadratics"),
    ),
  );

  const parentNotifications = await parent.get("/api/notifications");
  check(
    "the linked parent is notified too",
    parentNotifications.body?.data?.notifications?.some(
      (n: any) => n.type === "ASSIGNMENT",
    ),
  );

  const strangerNotifications = await strangerParent.get("/api/notifications");
  check(
    "an unrelated parent is not notified",
    strangerNotifications.body?.data?.notifications?.length === 0,
  );

  const submissionRes = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "My answers." },
  );
  await teacher.post(
    `/api/submissions/${submissionRes.body.data.submission.id}/grade`,
    { score: 20, feedback: "Revise the discriminant." },
  );

  const afterGrade = await student.get("/api/notifications?type=GRADE");
  check(
    "grading notifies the student",
    afterGrade.body?.data?.notifications?.some((n: any) => n.type === "GRADE"),
  );

  const examRes = await teacher.post("/api/exams", {
    title: "Unit test 1",
    classId: ids.classId,
    subjectId,
    examDate: daysFromNow(8),
    maxScore: 40,
  });
  const examId = examRes.body.data.exam.id as string;

  const afterExam = await student.get("/api/notifications?type=EXAM");
  check(
    "scheduling an exam notifies the class",
    afterExam.body?.data?.notifications?.some((n: any) => n.type === "EXAM"),
  );

  const unread = await student.get("/api/notifications?unreadOnly=true");
  const firstId = unread.body?.data?.notifications?.[0]?.id as string;
  check("unread count is reported", unread.body?.data?.unreadCount >= 1);

  const foreignRead = await otherTeacher.post(
    `/api/notifications/${firstId}/read`,
  );
  checkStatus(
    "another user cannot mark someone's notification read",
    foreignRead,
    404,
  );

  const markRead = await student.post(`/api/notifications/${firstId}/read`);
  checkStatus("student marks a notification read", markRead, 200);

  const readAll = await student.post("/api/notifications/read-all");
  checkStatus("student marks everything read", readAll, 200);

  const afterReadAll = await student.get("/api/notifications?unreadOnly=true");
  check(
    "no unread notifications remain",
    afterReadAll.body?.data?.unreadCount === 0,
  );

  section("2. Parent-teacher messaging");

  const contacts = await parent.get("/api/messages/contacts");
  checkStatus("parent lists contactable teachers", contacts, 200);

  const teacherUserId = contacts.body?.data?.contacts?.[0]?.contacts?.[0]?.userId;
  check("the child's teacher is contactable", Boolean(teacherUserId));

  const studentContacts = await student.get("/api/messages/contacts");
  checkStatus("students have no messaging contacts", studentContacts, 403);

  const anonSend = await anon.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "hello",
  });
  checkStatus("anonymous cannot send a message", anonSend, 401);

  const studentSend = await student.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "hello",
  });
  checkStatus("students cannot send messages", studentSend, 403);

  const emptyBody = await parent.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "",
  });
  checkStatus("an empty message is rejected", emptyBody, 422);

  const sent = await parent.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "How is my child getting on with quadratics?",
  });
  checkStatus("parent messages the teacher", sent, 201);
  const messageId = sent.body?.data?.message?.id as string;

  const strangerSend = await strangerParent.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "Tell me about this child.",
  });
  checkStatus(
    "an unrelated parent cannot message about that student",
    strangerSend,
    403,
  );

  const wrongTeacher = await parent.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.otherStudentId,
    body: "About a child who is not mine.",
  });
  checkStatus(
    "a parent cannot message about someone else's child",
    wrongTeacher,
    403,
  );

  const teacherToOutsider = await otherTeacher.post("/api/messages", {
    recipientUserId: teacherUserId,
    studentId: ids.studentId,
    body: "A teacher I do not teach.",
  });
  checkStatus(
    "a teacher cannot message about a student they do not teach",
    teacherToOutsider,
    403,
  );

  const teacherInbox = await teacher.get("/api/messages");
  check(
    "teacher receives the message",
    teacherInbox.body?.data?.messages?.some((m: any) => m.id === messageId),
  );
  check("unread count is reported", teacherInbox.body?.data?.unreadCount >= 1);

  const messageNotification = await teacher.get(
    "/api/notifications?type=MESSAGE",
  );
  check(
    "a message raises a notification",
    messageNotification.body?.data?.notifications?.length >= 1,
  );

  const reply = await teacher.post("/api/messages", {
    recipientUserId: (await parent.get("/api/auth/me")).body.data.user.id,
    studentId: ids.studentId,
    body: "She is improving. We will keep practising the discriminant.",
  });
  checkStatus("teacher replies to the parent", reply, 201);

  const teacherToTeacher = await teacher.post("/api/messages", {
    recipientUserId: (await otherTeacher.get("/api/auth/me")).body.data.user.id,
    studentId: ids.studentId,
    body: "Colleague chat.",
  });
  checkStatus(
    "teacher-to-teacher messaging is refused",
    teacherToTeacher,
    403,
  );

  const strangerInbox = await strangerParent.get("/api/messages");
  check(
    "an unrelated parent sees no messages",
    strangerInbox.body?.data?.messages?.length === 0,
  );

  const foreignMarkRead = await strangerParent.post(
    `/api/messages/${messageId}/read`,
  );
  checkStatus("only the recipient can mark it read", foreignMarkRead, 404);

  const markMessageRead = await teacher.post(`/api/messages/${messageId}/read`);
  checkStatus("recipient marks the message read", markMessageRead, 200);

  section("3. Student dashboard");

  const anonDash = await anon.get("/api/dashboard");
  checkStatus("anonymous dashboard is 401", anonDash, 401);

  const studentDash = await student.get("/api/dashboard");
  checkStatus("student dashboard loads", studentDash, 200);
  const sd = studentDash.body?.data;
  check("dashboard role comes from the session", sd?.role === "STUDENT");
  check("student dashboard reports progress", Boolean(sd?.progress));
  check(
    "assignment completion is derived",
    typeof sd?.progress?.assignments?.completionRate === "number",
  );
  check(
    "graded average is derived from submissions",
    sd?.progress?.assignments?.averageScore === 40,
    JSON.stringify(sd?.progress?.assignments),
  );
  check("dashboard lists classes", sd?.classes?.length === 1);
  check(
    "dashboard lists the upcoming exam",
    sd?.upcomingExams?.some((e: any) => e.id === examId),
  );
  check(
    "dashboard lists recent grades",
    sd?.recentGrades?.some((g: any) => g.score === 20),
  );
  check("dashboard includes weak topics", Array.isArray(sd?.weakTopics));
  check(
    "dashboard includes practice tests",
    Array.isArray(sd?.practiceTests),
  );

  section("4. Teacher dashboard");

  const teacherDash = await teacher.get("/api/dashboard");
  checkStatus("teacher dashboard loads", teacherDash, 200);
  const td = teacherDash.body?.data;
  check("teacher dashboard has the teacher role", td?.role === "TEACHER");
  check("teacher totals are reported", td?.totals?.classes === 1 && td?.totals?.students === 1);
  check(
    "class performance is averaged",
    td?.classes?.[0]?.averageScore === 40,
    JSON.stringify(td?.classes?.[0]),
  );
  check("teacher sees recent submissions", td?.recentSubmissions?.length >= 1);
  check(
    "teacher sees upcoming exams",
    td?.upcomingExams?.some((e: any) => e.id === examId),
  );
  check(
    "teacher sees class-level weak topics",
    Array.isArray(td?.classWeakTopics),
  );
  check("teacher sees unread message count", td?.unreadMessages >= 0);

  section("5. Parent dashboard");

  const parentDash = await parent.get("/api/dashboard");
  checkStatus("parent dashboard loads", parentDash, 200);
  const pd = parentDash.body?.data;
  check("parent dashboard has the parent role", pd?.role === "PARENT");
  check("parent sees exactly their linked child", pd?.children?.length === 1);
  check(
    "the child is the linked student",
    pd?.children?.[0]?.student?.id === ids.studentId,
  );
  check(
    "parent sees the child's progress",
    typeof pd?.children?.[0]?.progress?.assignments?.completionRate === "number",
  );
  check(
    "parent sees the child's upcoming exams",
    pd?.children?.[0]?.upcomingExams?.some((e: any) => e.id === examId),
  );
  check(
    "parent sees the child's teachers for messaging",
    pd?.children?.[0]?.teachers?.length >= 1,
  );
  check("parent sees weak topics", Array.isArray(pd?.children?.[0]?.weakTopics));

  const strangerDash = await strangerParent.get("/api/dashboard");
  check(
    "an unrelated parent sees no children",
    strangerDash.body?.data?.children?.length === 0,
  );

  section("6. Derived progress endpoint");

  const progress = await student.get(
    `/api/students/${ids.studentId}/progress`,
  );
  checkStatus("student reads their own progress", progress, 200);
  check(
    "progress covers assignments, exams, practice and mistakes",
    Boolean(
      progress.body?.data?.progress?.assignments &&
        progress.body?.data?.progress?.exams &&
        progress.body?.data?.progress?.practice &&
        progress.body?.data?.progress?.mistakes,
    ),
  );
  check(
    "per-subject averages are derived",
    progress.body?.data?.progress?.subjects?.some(
      (s: any) => s.subjectId === subjectId && s.averageScore === 40,
    ),
  );

  const parentProgress = await parent.get(
    `/api/students/${ids.studentId}/progress`,
  );
  checkStatus("parent reads their child's progress", parentProgress, 200);

  const strangerProgress = await strangerParent.get(
    `/api/students/${ids.studentId}/progress`,
  );
  checkStatus("unrelated parent cannot", strangerProgress, 403);

  const teacherProgress = await teacher.get(
    `/api/students/${ids.studentId}/progress`,
  );
  checkStatus("teacher reads their own student's progress", teacherProgress, 200);

  const foreignTeacherProgress = await otherTeacher.get(
    `/api/students/${ids.studentId}/progress`,
  );
  checkStatus(
    "a teacher outside the class cannot",
    foreignTeacherProgress,
    403,
  );

  void Client;
  summary("Phase 5");
}

main().catch((error) => {
  console.error("Phase 5 test run crashed:", error);
  process.exitCode = 1;
});
