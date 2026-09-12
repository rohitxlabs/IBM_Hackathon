import { SessionProvider } from "@/hooks/useSession";
import { AuthGate } from "@/components/auth";
import { AppShell } from "@/components/layout";

/**
 * Frame for every signed-in screen. The session is fetched once here and
 * shared through context, so individual pages never re-request it.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </SessionProvider>
  );
}
