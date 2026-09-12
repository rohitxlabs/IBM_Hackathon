import { ComingSoon } from "@/components/common";

export default function ParentProgressPage() {
  return (
    <ComingSoon
      title="Progress"
      description="Your child's progress will appear here."
      crumbs={[{ label: "Parent", href: "/parent" }, { label: "Progress" }]}
    />
  );
}
