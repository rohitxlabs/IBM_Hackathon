import { ComingSoon } from "@/components/common";

export default function StudentWeakTopicsPage() {
  return (
    <ComingSoon
      title="Weak Topics"
      description="The topics worth more practice will appear here."
      crumbs={[{ label: "Student", href: "/student" }, { label: "Weak Topics" }]}
    />
  );
}
