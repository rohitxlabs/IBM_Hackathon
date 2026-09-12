import { AuthGate } from "@/components/auth";

/**
 * Restricts this section to parent accounts. Navigation already hides the other
 * roles' links, but a URL typed by hand would otherwise still render the
 * screen, so the gate is applied to the whole section rather than per page.
 *
 * This is a usability guard. The backend independently refuses any request a
 * role is not entitled to make.
 */
export default function ParentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate allow={["PARENT"]}>{children}</AuthGate>;
}
