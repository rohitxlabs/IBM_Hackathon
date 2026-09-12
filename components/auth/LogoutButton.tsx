"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";

/** Signs the user out through the session provider. */
export function LogoutButton({ className = "" }: { className?: string }) {
  const { signOut } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${className}`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
