/**
 * Phase 4 API tests: mistake tracking, deterministic weak-topic detection,
 * practice test generation and marking, and the AI failure paths.
 * Run with: npm run test:phase4
 */
import { check, checkStatus, section, summary } from "./lib/api-client";
import { buildFixture, daysFromNow } from "./lib/fixtures";

async function main() {
  const f = await buildFixture();
  const { teacher, student, otherStudent, parent, strangerParent, anon, ids } = f;

  // Subject and topics to hang the learning data on.
  const subjectRes = await teacher.post("/api/subjects", {
    name: "Mathematics",
    code: `MATH${f.suffix}`,
    classId: ids.classId,
  });
  const subjectId = subjectRes.body.data.subject.id as string;

  const weakTopicRes = await teacher.post("/api/topics", {
    subjectId,
    name: "Quadratic Equations",
    orderIndex: 1,
  });
  const weakTopicId = weakTopicRes.body.data.topic.id as string;

  const strongTopicRes = await teacher.post("/api/topics", {
    subjectId,
    name: "Linear Equations",
    orderIndex: 2,
  });
  const strongTopicId = strongTopicRes.body.data.topic.id as string;

  section("1. Recording mistakes");

  const anonRecord = await anon.post("/api/mistakes", {
    subjectId,
    question: "q",
    studentAnswer: "a",
    correctAnswer: "b",
  });
  checkStatus("anonymous cannot record a mistake", anonRecord, 401);

  const invalid = await student.post("/api/mistakes", {
    subjectId,
    question: "",
    studentAnswer: "a",
    correctAnswer: "b",
  });
  checkStatus("an empty question is rejected", invalid, 422);

  const mismatchedTopic = await student.post("/api/mistakes", {
    subjectId,
    topicId: ids.classId,
    question: "Mismatched topic",
    studentAnswer: "a",
    correctAnswer: "b",
  });
  check(
    "a topic from another subject is rejected",
    mismatchedTopic.status === 400 || mismatchedTopic.status === 404,
    `got ${mismatchedTopic.status}`,
  );

  for (const [question, answer, correct] of [
    ["Find the roots of x^2 - 5x + 6 = 0.", "x = 1, 6", "x = 2, 3"],
    ["Discriminant of 2x^2 + 3x + 5?", "9", "-31"],
    ["Solve x^2 = 16.", "x = 4", "x = 4 or x = -4"],
  ]) {
    const res = await student.post("/api/mistakes", {
      subjectId,
      topicId: weakTopicId,
      question,
      studentAnswer: answer,
      correctAnswer: correct,
      source: "SELF_REPORTED",
    });
    checkStatus(`student records a mistake: ${question.slice(0, 24)}…`, res, 201);
  }

  const parentRecord = await parent.post("/api/mistakes", {
    studentId: ids.studentId,
    subjectId,
    topicId: weakTopicId,
    question: "Parent should not write this",
    studentAnswer: "a",
    correctAnswer: "b",
  });
  checkStatus("parents cannot record mistakes", parentRecord, 403);

  const peerRecord = await otherStudent.post("/api/mistakes", {
    studentId: ids.studentId,
    subjectId,
    question: "Injected for someone else",
    studentAnswer: "a",
    correctAnswer: "b",
  });
  check(
    "a student cannot record a mistake against another student",
    peerRecord.status === 403 || peerRecord.status === 404,
    `got ${peerRecord.status}`,
  );

  section("2. Reading and filtering mistakes");

  const ownMistakes = await student.get("/api/mistakes");
  check(
    "student lists their own mistakes",
    ownMistakes.body?.data?.mistakes?.length >= 3,
  );
  check(
    "mistake list is scoped to the student",
    ownMistakes.body?.data?.mistakes?.every(
      (m: any) => m.studentId === ids.studentId,
    ),
  );

  const byTopic = await student.get(`/api/mistakes?topicId=${weakTopicId}`);
  check(
    "filtering by topic works",
    byTopic.body?.data?.mistakes?.every((m: any) => m.topicId === weakTopicId),
  );

  const bySubject = await student.get(`/api/mistakes?subjectId=${subjectId}`);
  check(
    "filtering by subject works",
    bySubject.body?.data?.mistakes?.length >= 3,
  );

  const bySource = await student.get("/api/mistakes?source=EXAM");
  check(
    "filtering by source excludes other sources",
    bySource.body?.data?.mistakes?.length === 0,
  );

  const grouped = await student.get("/api/mistakes?groupBy=TOPIC");
  check(
    "grouping by topic returns counts",
    grouped.body?.data?.groups?.some(
      (g: any) => g.topicId === weakTopicId && g.count >= 3,
    ),
  );

  const parentMistakes = await parent.get(
    `/api/mistakes?studentId=${ids.studentId}`,
  );
  check(
    "parent reads their child's mistakes",
    parentMistakes.status === 200 &&
      parentMistakes.body?.data?.mistakes?.length >= 3,
  );

  const strangerMistakes = await strangerParent.get(
    `/api/mistakes?studentId=${ids.studentId}`,
  );
  checkStatus(
    "unrelated parent cannot read them",
    strangerMistakes,
    403,
  );

  const peerMistakes = await otherStudent.get(
    `/api/mistakes?studentId=${ids.studentId}`,
  );
  checkStatus("another student cannot read them", peerMistakes, 403);

  const teacherMistakes = await teacher.get(
    `/api/mistakes?studentId=${ids.studentId}`,
  );
  checkStatus("teacher reads their own student's mistakes", teacherMistakes, 200);

  section("3. Weak-topic detection");

  // Graded work so the academic signal contributes too.
  const assignmentRes = await teacher.post("/api/assignments", {
    title: "Quadratics practice",
    description: "Ten questions.",
    classId: ids.classId,
    subjectId,
    topicId: weakTopicId,
    dueDate: daysFromNow(2),
    maxScore: 100,
  });
  const assignmentId = assignmentRes.body.data.assignment.id as string;

  const submissionRes = await student.post(
    `/api/assignments/${assignmentId}/submissions`,
    { content: "My answers." },
  );
  await teacher.post(
    `/api/submissions/${submissionRes.body.data.submission.id}/grade`,
    { score: 30, feedback: "Review the discriminant." },
  );

  const strongAssignment = await teacher.post("/api/assignments", {
    title: "Linear equations practice",
    description: "Ten questions.",
    classId: ids.classId,
    subjectId,
    topicId: strongTopicId,
    dueDate: daysFromNow(2),
    maxScore: 100,
  });
  const strongSubmission = await student.post(
    `/api/assignments/${strongAssignment.body.data.assignment.id}/submissions`,
    { content: "My answers." },
  );
  await teacher.post(
    `/api/submissions/${strongSubmission.body.data.submission.id}/grade`,
    { score: 95 },
  );

  const weak = await student.get("/api/weak-topics");
  checkStatus("student reads their weak topics", weak, 200);

  const weakEntry = weak.body?.data?.topics?.find(
    (t: any) => t.topicId === weakTopicId,
  );
  check("the poorly performing topic is flagged weak", Boolean(weakEntry));
  check(
    "weak topic reports the mistake count",
    weakEntry?.mistakeCount >= 3,
    JSON.stringify(weakEntry),
  );
  check(
    "weak topic reports graded accuracy",
    weakEntry?.academicAccuracy !== null &&
      weakEntry?.academicAccuracy <= 0.4,
  );
  check(
    "weakness score is a bounded number",
    typeof weakEntry?.weaknessScore === "number" &&
      weakEntry.weaknessScore >= 0 &&
      weakEntry.weaknessScore <= 100,
  );
  check(
    "weak topic explains itself",
    Array.isArray(weakEntry?.reasons) && weakEntry.reasons.length > 0,
  );
  check(
    "the strong topic is not flagged",
    !weak.body?.data?.topics?.some((t: any) => t.topicId === strongTopicId),
  );

  const withStrong = await student.get("/api/weak-topics?includeStrong=true");
  check(
    "includeStrong returns the strong topic too",
    withStrong.body?.data?.topics?.some((t: any) => t.topicId === strongTopicId),
  );

  const repeat = await student.get("/api/weak-topics");
  check(
    "weak-topic detection is deterministic across calls",
    JSON.stringify(repeat.body?.data?.topics) ===
      JSON.stringify(weak.body?.data?.topics),
  );

  const parentWeak = await parent.get(
    `/api/weak-topics?studentId=${ids.studentId}`,
  );
  checkStatus("parent reads their child's weak topics", parentWeak, 200);

  const strangerWeak = await strangerParent.get(
    `/api/weak-topics?studentId=${ids.studentId}`,
  );
  checkStatus("unrelated parent cannot", strangerWeak, 403);

  section("4. Practice test generation");

  const parentCreates = await parent.post("/api/practice-tests", {
    studentId: ids.studentId,
    subjectId,
  });
  checkStatus("parents cannot create practice tests", parentCreates, 403);

  const badCount = await student.post("/api/practice-tests", {
    subjectId,
    questionCount: 999,
  });
  checkStatus("an out-of-range question count is rejected", badCount, 422);

  const testRes = await student.post("/api/practice-tests", {
    subjectId,
    difficulty: "MEDIUM",
    questionType: "MCQ",
    questionCount: 4,
    useWeakTopics: true,
  });
  checkStatus("student creates a practice test", testRes, 201);

  const testId = testRes.body?.data?.test?.id as string;
  const questions = testRes.body?.data?.test?.questions ?? [];

  check("the requested number of questions is generated", questions.length === 4);
  check(
    "questions carry options for multiple choice",
    questions.every((q: any) => Array.isArray(q.options) && q.options.length > 1),
  );
  check(
    "the answer key is not exposed at creation",
    questions.every((q: any) => q.correctAnswer === undefined),
  );
  check(
    "personalisation reports the weak topics used",
    testRes.body?.data?.personalisation?.weakTopicsUsed?.includes(
      "Quadratic Equations",
    ),
  );
  check(
    "personalisation reports how many past mistakes were used",
    testRes.body?.data?.personalisation?.pastMistakesUsed >= 3,
  );
  check(
    "the provider is recorded on the test",
    ["mock", "gemini"].includes(testRes.body?.data?.test?.generatedBy),
  );

  const peerReads = await otherStudent.get(`/api/practice-tests/${testId}`);
  checkStatus("another student cannot read the test", peerReads, 403);

  const beforeSubmit = await student.get(`/api/practice-tests/${testId}`);
  check(
    "answers stay hidden before submission",
    beforeSubmit.body?.data?.test?.questions?.every(
      (q: any) => q.correctAnswer === undefined,
    ),
  );

  section("5. Taking and marking a practice test");

  const peerStarts = await otherStudent.post(
    `/api/practice-tests/${testId}/start`,
  );
  checkStatus("another student cannot start the test", peerStarts, 403);

  const start = await student.post(`/api/practice-tests/${testId}/start`);
  checkStatus("student starts the test", start, 200);
  check(
    "starting marks the test IN_PROGRESS",
    start.body?.data?.test?.status === "IN_PROGRESS",
  );

  const foreignAnswer = await student.post(
    `/api/practice-tests/${testId}/submit`,
    { answers: [{ questionId: ids.classId, answer: "x" }] },
  );
  checkStatus(
    "an answer for a question outside the test is rejected",
    foreignAnswer,
    400,
  );

  // Answer the first two correctly and the rest wrongly.
  const full = await student.get(`/api/practice-tests/${testId}`);
  const ordered = full.body.data.test.questions;

  const answers = ordered.map((q: any, index: number) => ({
    questionId: q.id,
    answer: index < 2 ? q.options[0] : q.options[q.options.length - 1],
  }));

  const submit = await student.post(`/api/practice-tests/${testId}/submit`, {
    answers,
  });
  checkStatus("student submits the test", submit, 200);
  check(
    "the score is calculated",
    submit.body?.data?.score?.correct === 2 &&
      submit.body?.data?.score?.total === 4 &&
      submit.body?.data?.score?.percentage === 50,
    JSON.stringify(submit.body?.data?.score),
  );
  check(
    "incorrect answers are identified",
    submit.body?.data?.incorrect?.length === 2,
  );
  check(
    "each incorrect answer comes with an explanation",
    submit.body?.data?.incorrect?.every(
      (i: any) => typeof i.explanation === "string" && i.explanation.length > 10,
    ),
  );
  check(
    "multiple choice marking makes no AI calls",
    submit.body?.data?.aiCalls === 0,
  );

  const resubmit = await student.post(`/api/practice-tests/${testId}/submit`, {
    answers,
  });
  checkStatus("a completed test cannot be submitted twice", resubmit, 409);

  const afterSubmit = await student.get(`/api/practice-tests/${testId}`);
  check(
    "answers are revealed after submission",
    afterSubmit.body?.data?.test?.questions?.every(
      (q: any) => typeof q.correctAnswer === "string",
    ),
  );
  check(
    "the stored result matches the returned score",
    afterSubmit.body?.data?.test?.score === 2 &&
      afterSubmit.body?.data?.test?.totalScore === 4 &&
      afterSubmit.body?.data?.test?.status === "COMPLETED",
  );

  section("6. Practice feeds back into mistakes and weak topics");

  const practiceMistakes = await student.get("/api/mistakes?source=PRACTICE");
  check(
    "wrong practice answers are recorded as mistakes",
    practiceMistakes.body?.data?.mistakes?.length === 2,
  );

  const explain = await student.post(
    `/api/practice-questions/${submit.body.data.incorrect[0].questionId}/explain`,
  );
  checkStatus("explanation endpoint returns an explanation", explain, 200);
  check(
    "the stored explanation is reused rather than regenerated",
    explain.body?.data?.cached === true,
  );

  const peerExplain = await otherStudent.post(
    `/api/practice-questions/${submit.body.data.incorrect[0].questionId}/explain`,
  );
  checkStatus("another student cannot request it", peerExplain, 403);

  const parentTests = await parent.get(
    `/api/practice-tests?studentId=${ids.studentId}`,
  );
  check(
    "parent sees the child's practice tests",
    parentTests.body?.data?.tests?.some((t: any) => t.id === testId),
  );

  const strangerTests = await strangerParent.get(
    `/api/practice-tests?studentId=${ids.studentId}`,
  );
  checkStatus("unrelated parent cannot", strangerTests, 403);

  summary("Phase 4");
}

main().catch((error) => {
  console.error("Phase 4 test run crashed:", error);
  process.exitCode = 1;
});
