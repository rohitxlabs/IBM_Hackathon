"use client";

import Link from "next/link";
import type { NavItem } from "@/lib/constants/navigation";

interface NavLinksProps {
  items: NavItem[];
  pathname: string;
  accent: string;
  onNavigate?: () => void;
}

/** Checks whether a nav entry owns the current path. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical nav list shared by the desktop sidebar and the mobile drawer. */
export function NavLinks({
  items,
  pathname,
  accent,
  onNavigate,
}: NavLinksProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                active
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(90deg, ${accent}, var(--gradient-mid))`,
                      boxShadow: `0 4px 12px -4px ${accent}`,
                    }
                  : undefined
              }
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
