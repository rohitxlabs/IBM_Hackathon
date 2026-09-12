"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { matchNavItem, roleLabel } from "@/lib/constants/navigation";
import { useSession } from "@/hooks/useSession";

/** Initials fallback when a user has no avatar. */
function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header({ onOpenNav }: { onOpenNav?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!user) return null;

  const current = matchNavItem(user.role, pathname);
  const home = `/${user.role.toLowerCase()}`;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {current?.label ?? roleLabel[user.role]}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {roleLabel[user.role]} portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={`${home}/notifications`}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-xs font-bold">
                {initials(user.name)}
              </span>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[10rem] truncate">
                {user.name}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  href={`${home}/profile`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>

                <div className="border-t border-gray-100 my-1" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
