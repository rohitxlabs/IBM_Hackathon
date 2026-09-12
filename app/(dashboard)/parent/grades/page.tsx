import { ComingSoon } from "@/components/common";

export default function ParentGradesPage() {
  return (
    <ComingSoon
      title="Grades"
      description="Your child's grades will appear here."
      crumbs={[{ label: "Parent", href: "/parent" }, { label: "Grades" }]}
    />
  );
}
