import { ComingSoon } from "@/components/common";

export default function StudentNotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="Your notifications will appear here."
      crumbs={[{ label: "Student", href: "/student" }, { label: "Notifications" }]}
    />
  );
}
