"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ErrorState, LoadingSpinner } from "@/components/common";
import { useSession } from "@/hooks/useSession";
import { roleLabel } from "@/lib/constants/navigation";
import type { Role } from "@/lib/api/types";
import { Logo } from "@/components/layout/Logo";

/**
 * Gates the signed-in area.
 *
 * This is a usability guard, not a security control: it decides what to
 * render while the session is being checked and where to send someone who is
 * signed out or in the wrong section. Actual access is enforced by the
 * backend on every request.
 */
export function AuthGate({
  children,
  allow,
}: {
  children: React.ReactNode;
  /** Roles permitted in this section; omit to allow any signed-in user. */
  allow?: Role[];
}) {
  const { user, status, error, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Send signed-out visitors to the login screen, remembering where they were.
  useEffect(() => {
    if (status === "unauthenticated" && !error) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [status, error, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <LoadingSpinner label="Checking your session" />
      </div>
    );
  }

  if (error) {
    return (
      <CenteredPanel>
        <ErrorState
          title="We couldn't confirm your session"
          message={error}
          onRetry={() => void refresh()}
        />
      </CenteredPanel>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <CenteredPanel>
        <div className="text-center">
          <h1
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your session has ended
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in again to pick up where you left off.
          </p>
          <Link href="/login" className="inline-block mt-6">
            <Button>Sign in</Button>
          </Link>
        </div>
      </CenteredPanel>
    );
  }

  if (allow && !allow.includes(user.role)) {
    return (
      <CenteredPanel>
        <div className="text-center">
          <h1
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            This area isn&apos;t part of your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You are signed in as a {roleLabel[user.role].toLowerCase()}. Head
            back to your own dashboard to continue.
          </p>
          <Link
            href={`/${user.role.toLowerCase()}`}
            className="inline-block mt-6"
          >
            <Button>Go to my dashboard</Button>
          </Link>
        </div>
      </CenteredPanel>
    );
  }

  return <>{children}</>;
}

function CenteredPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[var(--surface)] px-4">
      <Logo href="/" />
      <div className="w-full max-w-md bg-white rounded-[var(--radius-lg)] border border-gray-200 p-8">
        {children}
      </div>
    </div>
  );
}
