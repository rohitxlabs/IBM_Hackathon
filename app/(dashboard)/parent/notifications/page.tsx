import { ComingSoon } from "@/components/common";

export default function ParentNotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="Your notifications will appear here."
      crumbs={[{ label: "Parent", href: "/parent" }, { label: "Notifications" }]}
    />
  );
}
