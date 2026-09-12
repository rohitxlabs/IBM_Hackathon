import { ComingSoon } from "@/components/common";

export default function ParentExamsPage() {
  return (
    <ComingSoon
      title="Exams"
      description="Your child's exams will appear here."
      crumbs={[{ label: "Parent", href: "/parent" }, { label: "Exams" }]}
    />
  );
}
