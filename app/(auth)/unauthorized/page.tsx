"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

const COPY: Record<string, { title: string; description: string }> = {
  expired: {
    title: "Your session has expired",
    description: "For your security, please sign in again to continue.",
  },
  forbidden: {
    title: "You don't have access to this page",
    description: "This area is restricted to a different role. Try signing in with the right account.",
  },
  default: {
    title: "You're not signed in",
    description: "Please sign in to view this page.",
  },
};

function UnauthorizedContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "default";
  const copy = COPY[reason] ?? COPY.default;

  return (
    <div className="card bg-white p-8 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-danger-50 text-danger-600 mx-auto mb-5">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        {copy.title}
      </h1>
      <p className="text-sm text-gray-500 mb-6">{copy.description}</p>
      <Link href="/login">
        <Button fullWidth>Go to Sign In</Button>
      </Link>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense>
      <UnauthorizedContent />
    </Suspense>
  );
}
