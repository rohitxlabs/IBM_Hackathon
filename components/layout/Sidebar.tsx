"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { navigationFor, roleAccentVar, roleLabel } from "@/lib/constants/navigation";
import { useSession } from "@/hooks/useSession";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

/**
 * Desktop sidebar and mobile drawer.
 *
 * The link set comes from the role on the session, so a parent never sees a
 * teacher's navigation even if they type a teacher URL. That is presentation
 * only — the backend still authorises every request.
 */
export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useSession();

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!mobileOpen || !onClose) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, onClose]);

  if (!user) return null;

  const items = navigationFor(user.role);
  const accent = roleAccentVar[user.role];

  const panel = (
    <>
      <div className="p-6 border-b border-gray-100">
        <Logo href="/" />
        <p className="mt-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
          {roleLabel[user.role]}
        </p>
      </div>

      <nav aria-label="Main" className="flex-1 p-4 overflow-y-auto">
        <NavLinks
          items={items}
          pathname={pathname}
          accent={accent}
          onNavigate={onClose}
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/ai-assistant"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </span>
          Jinni AI
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        {panel}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-gray-900/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white flex flex-col transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-4 p-2 rounded-lg text-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Close navigation"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {panel}
        </aside>
      </div>
    </>
  );
}
