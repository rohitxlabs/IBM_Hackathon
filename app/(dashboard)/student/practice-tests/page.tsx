import { ComingSoon } from "@/components/common";

export default function StudentPracticeTestsPage() {
  return (
    <ComingSoon
      title="Practice Tests"
      description="Personalised practice tests will appear here."
      crumbs={[{ label: "Student", href: "/student" }, { label: "Practice Tests" }]}
    />
  );
}
