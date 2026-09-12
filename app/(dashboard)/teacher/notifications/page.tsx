import { ComingSoon } from "@/components/common";

export default function TeacherNotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="Your notifications will appear here."
      crumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Notifications" }]}
    />
  );
}
