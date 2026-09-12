"use client";

import Link from "next/link";
import { mockCourses, mockAssignments, mockAttendance, mockGrades } from "@/lib/mock-data";
import { mockStudents } from "@/lib/mock-data/users";

export default function StudentDashboard() {
  const courses = mockCourses.slice(0, 4);
  const upcoming = mockAssignments.filter((a) => a.status === "pending").slice(0, 3);
  const recentGrades = mockGrades.slice(0, 3);
  const attendanceRate = Math.round(
    (mockAttendance.filter((a) => a.status === "present").length / mockAttendance.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Welcome back, Student! 👋
          </h1>
          <p className="text-white/80">
            You have {upcoming.length} pending assignments. Keep up the great work!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Courses", value: courses.length, icon: "📚", color: "from-blue-500 to-indigo-500" },
          { label: "Avg Grade", value: "85%", icon: "📊", color: "from-purple-500 to-pink-500" },
          { label: "Attendance", value: `${attendanceRate}%`, icon: "✅", color: "from-green-500 to-emerald-500" },
          { label: "Pending", value: upcoming.length, icon: "📝", color: "from-orange-500 to-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="card bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Upcoming Assignments</h2>
            <Link href="/student/assignments" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.subject} · Due {a.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Recent Grades</h2>
            <Link href="/student/grades" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentGrades.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-sm font-bold">
                  {g.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{g.title}</div>
                  <div className="text-xs text-gray-400">{g.subject}</div>
                </div>
                <div className="text-sm font-semibold text-[var(--accent)]">{g.score}/{g.maxScore}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-white">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "AI Assistant", href: "/ai-assistant", icon: "✨" },
            { label: "My Courses", href: "/student/courses", icon: "📚" },
            { label: "Attendance", href: "/student/attendance", icon: "📋" },
            { label: "Analytics", href: "/student/analytics", icon: "📊" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[var(--accent)] hover:bg-gray-50 transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--foreground)]">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
