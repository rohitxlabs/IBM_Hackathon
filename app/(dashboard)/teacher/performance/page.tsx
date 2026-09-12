import { ComingSoon } from "@/components/common";

export default function TeacherPerformancePage() {
  return (
    <ComingSoon
      title="Performance"
      description="Class and student performance will appear here."
      crumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Performance" }]}
    />
  );
}
