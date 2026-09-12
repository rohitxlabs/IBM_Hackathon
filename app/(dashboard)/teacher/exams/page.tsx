import { ComingSoon } from "@/components/common";

export default function TeacherExamsPage() {
  return (
    <ComingSoon
      title="Exams"
      description="Your exams and results will appear here."
      crumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Exams" }]}
    />
  );
}
