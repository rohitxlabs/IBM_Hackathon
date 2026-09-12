import { ComingSoon } from "@/components/common";

export default function StudentExamsPage() {
  return (
    <ComingSoon
      title="Exams"
      description="Upcoming exams and your results will appear here."
      crumbs={[{ label: "Student", href: "/student" }, { label: "Exams" }]}
    />
  );
}
