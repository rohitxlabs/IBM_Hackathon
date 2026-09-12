import type { Role } from "@/lib/api/types";

/**
 * Role-aware navigation.
 *
 * One source of truth for the sidebar, the mobile tab bar and breadcrumb
 * labels, so the three can never drift apart. Which list a user sees is
 * decided by the role on their session, never by the URL they happen to be
 * visiting — the backend is still the thing that enforces access.
 */

export interface NavItem {
  label: string;
  href: string;
  /** SVG path data drawn at 24x24 with a 1.5 stroke. */
  icon: string;
  /** Shown in the mobile tab bar (space for five). */
  primary?: boolean;
}

const icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  assignment:
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  exam: "M9 2h6a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2z M9 13l2 2 4-4",
  grades: "M4 19V5 M4 19h16 M8 16V9 M12 16v-4 M16 16v-7",
  mistakes:
    "M12 9v4 M12 17h.01 M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  target:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  practice:
    "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
  classes:
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  students:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87",
  submissions:
    "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  performance:
    "M3 3v18h18 M18.7 8l-5.1 5.2-2.8-2.7L7 14.3",
  children:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 21a8 8 0 0 0-16 0",
  progress:
    "M22 12h-4l-3 9L9 3l-3 9H2",
  messages:
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  profile:
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
} as const;

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: icons.home, primary: true },
  {
    label: "Assignments",
    href: "/student/assignments",
    icon: icons.assignment,
    primary: true,
  },
  { label: "Exams", href: "/student/exams", icon: icons.exam },
  { label: "Grades", href: "/student/grades", icon: icons.grades, primary: true },
  { label: "Mistakes", href: "/student/mistakes", icon: icons.mistakes },
  {
    label: "Weak Topics",
    href: "/student/weak-topics",
    icon: icons.target,
    primary: true,
  },
  {
    label: "Practice Tests",
    href: "/student/practice-tests",
    icon: icons.practice,
  },
  { label: "Profile", href: "/student/profile", icon: icons.profile },
];

const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher", icon: icons.home, primary: true },
  {
    label: "Classes",
    href: "/teacher/classes",
    icon: icons.classes,
    primary: true,
  },
  { label: "Students", href: "/teacher/students", icon: icons.students },
  {
    label: "Assignments",
    href: "/teacher/assignments",
    icon: icons.assignment,
    primary: true,
  },
  {
    label: "Submissions",
    href: "/teacher/submissions",
    icon: icons.submissions,
    primary: true,
  },
  { label: "Exams", href: "/teacher/exams", icon: icons.exam },
  {
    label: "Performance",
    href: "/teacher/performance",
    icon: icons.performance,
  },
  { label: "Profile", href: "/teacher/profile", icon: icons.profile },
];

const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: icons.home, primary: true },
  {
    label: "Children",
    href: "/parent/children",
    icon: icons.children,
    primary: true,
  },
  {
    label: "Assignments",
    href: "/parent/assignments",
    icon: icons.assignment,
  },
  { label: "Grades", href: "/parent/grades", icon: icons.grades, primary: true },
  { label: "Exams", href: "/parent/exams", icon: icons.exam },
  { label: "Progress", href: "/parent/progress", icon: icons.progress },
  {
    label: "Messages",
    href: "/parent/messages",
    icon: icons.messages,
    primary: true,
  },
  { label: "Profile", href: "/parent/profile", icon: icons.profile },
];

const navByRole: Record<Role, NavItem[]> = {
  STUDENT: studentNav,
  TEACHER: teacherNav,
  PARENT: parentNav,
};

export function navigationFor(role: Role): NavItem[] {
  return navByRole[role];
}

/** The five entries the mobile tab bar shows. */
export function primaryNavigationFor(role: Role): NavItem[] {
  return navByRole[role].filter((item) => item.primary).slice(0, 5);
}

export const roleLabel: Record<Role, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

/** CSS custom property holding each role's accent colour. */
export const roleAccentVar: Record<Role, string> = {
  STUDENT: "var(--student-accent)",
  TEACHER: "var(--teacher-accent)",
  PARENT: "var(--parent-accent)",
};

/**
 * Best-matching nav entry for a path, used for active state and breadcrumbs.
 * The longest matching href wins so /student/assignments beats /student.
 */
export function matchNavItem(
  role: Role,
  pathname: string,
): NavItem | undefined {
  return navByRole[role]
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}
