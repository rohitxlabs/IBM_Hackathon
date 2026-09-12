import type { Notification } from "../types";

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "New Assignment Posted",
    message: "Mathematics - Quadratic Equations Problem Set due on Sep 10",
    type: "assignment",
    read: false,
    createdAt: "2026-09-05T10:30:00Z",
    link: "/student/assignments",
  },
  {
    id: "n2",
    title: "Grade Updated",
    message: "Your Chemistry quiz has been graded. Score: 92/100",
    type: "grade",
    read: false,
    createdAt: "2026-09-04T15:45:00Z",
    link: "/student/grades",
  },
  {
    id: "n3",
    title: "Attendance Alert",
    message: "You were marked absent in History on Sep 3",
    type: "attendance",
    read: true,
    createdAt: "2026-09-03T09:00:00Z",
    link: "/student/attendance",
  },
  {
    id: "n4",
    title: "School Announcement",
    message: "Annual Day celebration will be held on Sep 20",
    type: "announcement",
    read: true,
    createdAt: "2026-09-02T08:00:00Z",
  },
  {
    id: "n5",
    title: "Assignment Reminder",
    message: "Physics Lab Report is due tomorrow",
    type: "assignment",
    read: false,
    createdAt: "2026-09-05T08:00:00Z",
    link: "/student/assignments",
  },
  {
    id: "n6",
    title: "New Message from Teacher",
    message: "Mrs. Smith: Great improvement in your last test!",
    type: "message",
    read: true,
    createdAt: "2026-09-01T14:30:00Z",
  },
  {
    id: "n7",
    title: "Grade Updated",
    message: "Your History project has been graded. Score: 95/100",
    type: "grade",
    read: true,
    createdAt: "2026-08-30T16:00:00Z",
    link: "/student/grades",
  },
  {
    id: "n8",
    title: "Upcoming Test",
    message: "Mathematics test scheduled for Sep 15",
    type: "announcement",
    read: false,
    createdAt: "2026-08-29T10:00:00Z",
  },
];

export function getNotifications(): Notification[] {
  return mockNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUnreadNotifications(): Notification[] {
  return mockNotifications.filter((n) => !n.read);
}

export function getUnreadCount(): number {
  return mockNotifications.filter((n) => !n.read).length;
}

export function getNotificationsByType(type: Notification["type"]): Notification[] {
  return mockNotifications.filter((n) => n.type === type);
}

export function markAsRead(id: string): void {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
}

export function markAllAsRead(): void {
  mockNotifications.forEach((n) => {
    n.read = true;
  });
}
