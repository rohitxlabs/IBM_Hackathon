export type MockNotificationType =
  | "assignment"
  | "grade"
  | "attendance"
  | "announcement"
  | "message";

export type MockNotification = {
  id: string;
  type: MockNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const hoursAgo = (n: number) =>
  new Date(Date.now() - n * 60 * 60 * 1000).toISOString();

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    type: "assignment",
    title: "New Assignment Published",
    message:
      "Quadratic Equations Problem Set has been posted. It's due September 20.",
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: "n2",
    type: "grade",
    title: "Essay Graded",
    message:
      '"Essay: Shakespeare\'s Hamlet" received 42/50. Check feedback for comments.',
    read: false,
    createdAt: hoursAgo(6),
  },
  {
    id: "n3",
    type: "announcement",
    title: "Parent–Teacher Conferences",
    message:
      "Conferences are scheduled for September 28–30. Please book your slot via the portal.",
    read: true,
    createdAt: daysAgo(1),
  },
  {
    id: "n4",
    type: "attendance",
    title: "Attendance Alert",
    message:
      "Your child was marked late for Physics this morning. Contact the office with any questions.",
    read: false,
    createdAt: hoursAgo(4),
  },
  {
    id: "n5",
    type: "message",
    title: "New message from Ms. Thompson",
    message:
      "Thanks for your email! I'd love to meet on Wednesday to discuss Alex's progress.",
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: "n6",
    type: "assignment",
    title: "Assignment Due Soon",
    message:
      "Periodic Trends Worksheet is due in 2 days. Start early to ask questions in class.",
    read: true,
    createdAt: daysAgo(3),
  },
  {
    id: "n7",
    type: "grade",
    title: "Biology Project Marked",
    message:
      "Cell Division Modeling Project was graded 27/30. Great mitosis visualizations!",
    read: true,
    createdAt: daysAgo(4),
  },
  {
    id: "n8",
    type: "announcement",
    title: "Term 1 Exam Schedule",
    message:
      "The Term 1 mid-exam schedule is now available on the calendar page. Room assignments TBD.",
    read: true,
    createdAt: daysAgo(6),
  },
];

export function getNotifications(): MockNotification[] {
  return mockNotifications;
}
