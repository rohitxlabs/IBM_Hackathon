"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api/client";
import type { TeacherDashboard } from "@/lib/api/types";
import { LoadingPage } from "@/components/common";
import { getGreeting } from "@/lib/utils";

export default function TeacherDashboard() {
  const { user, status: sessionStatus } = useSession();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    let cancelled = false;
    async function load() {
      try {
        const data = await api.get<TeacherDashboard>("/api/dashboard");
        if (!cancelled) {
          setDashboard(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  if (sessionStatus === "loading") {
    return <LoadingPage />;
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="card bg-white p-8 text-center">
        <p className="text-gray-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !dashboard) {
    return (
      <div className="card bg-white p-8 text-center">
        <p className="text-gray-500">{error ?? "Could not load dashboard."}</p>
      </div>
    );
  }

  const greeting = getGreeting();
  const pendingGrading = dashboard.recentSubmissions.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[var(--teacher-accent)] to-purple-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {greeting}, {user?.name ?? "Teacher"}! 👩‍🏫
          </h1>
          <p className="text-white/80">
            You have {dashboard.totals.pendingGrading} assignments to grade. Your students are waiting!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Students", value: dashboard.totals.students, icon: "👨‍🎓", color: "from-indigo-500 to-blue-500" },
          { label: "Classes", value: dashboard.totals.classes, icon: "🏫", color: "from-purple-500 to-pink-500" },
          { label: "To Grade", value: dashboard.totals.pendingGrading, icon: "📝", color: "from-orange-500 to-red-500" },
          { label: "Unread Msgs", value: dashboard.unreadMessages, icon: "💬", color: "from-green-500 to-emerald-500" },
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
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Pending Grading</h2>
            <Link href="/teacher/grading" className="text-sm font-medium text-[var(--accent)] hover:underline">
              Grade All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingGrading.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nothing pending</p>
            ) : (
              pendingGrading.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                    {s.assignment.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.assignment.title}</div>
                    <div className="text-xs text-gray-400">{s.student.user.name} · {new Date(s.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Upcoming Exams</h2>
            <Link href="/teacher/classes" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard.upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nothing pending</p>
            ) : (
              dashboard.upcomingExams.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-xs font-bold">
                    {e.class.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-gray-400">{e.class.name} {e.class.section} · {new Date(e.examDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card bg-white">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Create Assignment", href: "/teacher/assignments", icon: "➕" },
            { label: "AI Grading", href: "/teacher/grading", icon: "🤖" },
            { label: "Mark Attendance", href: "/teacher/attendance", icon: "📋" },
            { label: "Notices", href: "/teacher/notices", icon: "📢" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[var(--teacher-accent)] hover:bg-gray-50 transition-all duration-200 group"
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
