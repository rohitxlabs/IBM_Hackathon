import { ComingSoon } from "@/components/common";

export default function TeacherSubmissionsPage() {
  return (
    <ComingSoon
      title="Submissions"
      description="Work waiting to be graded will appear here."
      crumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Submissions" }]}
    />
  );
}
