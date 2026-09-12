"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const studentTabs = [
  { label: "Home", href: "/student", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Courses", href: "/student/courses", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { label: "Grades", href: "/student/grades", icon: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { label: "AI", href: "/ai-assistant", icon: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" },
  { label: "More", href: "/student/attendance", icon: "M4 6h16M4 12h16M4 18h16" },
];

const teacherTabs = [
  { label: "Home", href: "/teacher", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Classes", href: "/teacher/classes", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" },
  { label: "Grading", href: "/teacher/grading", icon: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { label: "AI", href: "/ai-assistant", icon: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" },
  { label: "More", href: "/teacher/attendance", icon: "M4 6h16M4 12h16M4 18h16" },
];

const parentTabs = [
  { label: "Home", href: "/parent", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Children", href: "/parent/children", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" },
  { label: "Results", href: "/parent/results", icon: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { label: "AI", href: "/ai-assistant", icon: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" },
  { label: "More", href: "/parent/messages", icon: "M4 6h16M4 12h16M4 18h16" },
];

export function MobileNav() {
  const pathname = usePathname();
  const tabs = pathname.startsWith("/teacher") ? teacherTabs : pathname.startsWith("/parent") ? parentTabs : studentTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== `/${pathname.split("/")[1]}` && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "text-[var(--accent)]" : "text-gray-400"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
