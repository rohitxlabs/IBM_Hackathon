"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const role = pathname.startsWith("/teacher") ? "Teacher" : pathname.startsWith("/parent") ? "Parent" : "Student";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">{role} Portal</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <Link href={`${pathname.split("/")[1]}/profile`} className="flex items-center gap-2.5 pl-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-xs font-bold">
              {role[0]}
            </div>
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
