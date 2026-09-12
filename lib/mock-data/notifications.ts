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

export const mockNotifications: MockNotification[] = [];

export function getNotifications(): MockNotification[] {
  return mockNotifications;
}
