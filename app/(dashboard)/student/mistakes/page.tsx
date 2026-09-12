import { ComingSoon } from "@/components/common";

export default function StudentMistakesPage() {
  return (
    <ComingSoon
      title="Mistakes"
      description="The questions you got wrong, with explanations, will appear here."
      crumbs={[{ label: "Student", href: "/student" }, { label: "Mistakes" }]}
    />
  );
}
