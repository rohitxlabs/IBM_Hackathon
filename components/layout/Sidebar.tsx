"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const studentLinks = [
  { label: "Dashboard", href: "/student", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Courses", href: "/student/courses", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { label: "Assignments", href: "/student/assignments", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
  { label: "Attendance", href: "/student/attendance", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" },
  { label: "Grades", href: "/student/grades", icon: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { label: "Analytics", href: "/student/analytics", icon: "M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z" },
  { label: "Notices", href: "/student/notices", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
];

const teacherLinks = [
  { label: "Dashboard", href: "/teacher", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "My Classes", href: "/teacher/classes", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { label: "Students", href: "/teacher/students", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" },
  { label: "Assignments", href: "/teacher/assignments", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
  { label: "Grading", href: "/teacher/grading", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9.5 7A4 4 0 1 0 9.5 15 M22 21v-2a4 4 0 0 0-3-3.87" },
  { label: "Attendance", href: "/teacher/attendance", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" },
  { label: "Analytics", href: "/teacher/analytics", icon: "M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z" },
  { label: "Notices", href: "/teacher/notices", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" },
];

const parentLinks = [
  { label: "Dashboard", href: "/parent", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Children", href: "/parent/children", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" },
  { label: "Attendance", href: "/parent/attendance", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" },
  { label: "Results", href: "/parent/results", icon: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" },
  { label: "Assignments", href: "/parent/assignments", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
  { label: "Analytics", href: "/parent/analytics", icon: "M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z" },
  { label: "Messages", href: "/parent/messages", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { label: "Notices", href: "/parent/notices", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" },
];

function getLinks(pathname: string) {
  if (pathname.startsWith("/teacher")) return teacherLinks;
  if (pathname.startsWith("/parent")) return parentLinks;
  return studentLinks;
}

function getRoleColor(pathname: string) {
  if (pathname.startsWith("/teacher")) return "var(--teacher-accent)";
  if (pathname.startsWith("/parent")) return "var(--parent-accent)";
  return "var(--student-accent)";
}

export function Sidebar() {
  const pathname = usePathname();
  const links = getLinks(pathname);
  const roleColor = getRoleColor(pathname);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)]">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Jinni</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={isActive ? { boxShadow: `0 4px 12px -2px ${roleColor}40` } : {}}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/ai-assistant"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
          <span>Jinni AI</span>
        </Link>
      </div>
    </aside>
  );
}
