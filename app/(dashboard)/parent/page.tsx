"use client";

import Link from "next/link";
import { mockStudents } from "@/lib/mock-data/users";
import { mockGrades, mockAttendance } from "@/lib/mock-data";

export default function ParentDashboard() {
  const children = mockStudents.slice(0, 2);
  const recentGrades = mockGrades.slice(0, 4);
  const attendanceRate = Math.round(
    (mockAttendance.filter((a) => a.status === "present").length / mockAttendance.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[var(--parent-accent)] to-rose-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Welcome back, Parent! 👨‍👩‍👧
          </h1>
          <p className="text-white/80">
            Track your children&apos;s progress, attendance, and academic performance — all in one place.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Children", value: children.length, icon: "👧", color: "from-pink-500 to-rose-500" },
          { label: "Avg Grade", value: "87%", icon: "📊", color: "from-purple-500 to-indigo-500" },
          { label: "Attendance", value: `${attendanceRate}%`, icon: "✅", color: "from-green-500 to-emerald-500" },
          { label: "Messages", value: 3, icon: "💬", color: "from-blue-500 to-cyan-500" },
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
        {/* Children */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>My Children</h2>
            <Link href="/parent/children" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--parent-accent)] to-rose-400 flex items-center justify-center text-white text-sm font-bold">
                  {child.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{child.name}</div>
                  <div className="text-xs text-gray-400">Class {child.class} · Section {child.section}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-500">85%</div>
                  <div className="text-[10px] text-gray-400">Performance</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Recent Results</h2>
            <Link href="/parent/results" className="text-sm font-medium text-[var(--accent)] hover:underline">
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
            { label: "Messages", href: "/parent/messages", icon: "💬" },
            { label: "Attendance", href: "/parent/attendance", icon: "📋" },
            { label: "Analytics", href: "/parent/analytics", icon: "📊" },
            { label: "AI Assistant", href: "/ai-assistant", icon: "✨" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[var(--parent-accent)] hover:bg-gray-50 transition-all duration-200 group"
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
