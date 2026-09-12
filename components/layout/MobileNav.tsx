"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigationFor, roleAccentVar } from "@/lib/constants/navigation";
import { useSession } from "@/hooks/useSession";
import { isActivePath } from "./NavLinks";

/** Bottom tab bar on small screens, drawn from the same role navigation. */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useSession();

  if (!user) return null;

  const tabs = primaryNavigationFor(user.role);
  const accent = roleAccentVar[user.role];

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-area-bottom"
    >
      <ul className="flex items-stretch justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const active = isActivePath(pathname, tab.href);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                style={{ color: active ? accent : "var(--muted-foreground)" }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={tab.icon} />
                </svg>
                <span className="text-[10px] font-medium leading-tight text-center">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
