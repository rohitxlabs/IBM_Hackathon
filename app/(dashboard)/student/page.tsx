"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api/client";
import type { StudentDashboard } from "@/lib/api/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, getGreeting } from "@/lib/utils";

export default function StudentDashboard() {
  const { user, status: sessionStatus } = useSession();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    let cancelled = false;
    api
      .get<StudentDashboard>("/api/dashboard")
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden animate-pulse">
          <div className="h-8 w-64 bg-white/20 rounded mb-3" />
          <div className="h-4 w-80 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card bg-white animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-12 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !user) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please sign in to view your dashboard."
      />
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              {getGreeting()}, {user.name}! 👋
            </h1>
            <p className="text-white/80">
              Your dashboard is loading. Check back in a moment.
            </p>
          </div>
        </div>
        <EmptyState
          title="No dashboard data yet"
          description={
            error ??
            "Your classes, assignments, and grades will appear here once your teachers add them."
          }
        />
      </div>
    );
  }

  const { progress, classes, upcomingAssignments, upcomingExams, recentGrades, practiceTests } = dashboard;

  const stats = [
    {
      label: "Classes",
      value: classes.length,
      icon: "📚",
      color: "from-blue-500 to-indigo-500",
    },
    {
      label: "Avg Score",
      value: progress.exams.averageScore != null ? `${Math.round(progress.exams.averageScore)}%` : "—",
      icon: "📊",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Assignments Done",
      value: `${progress.assignments.submitted}/${progress.assignments.total}`,
      icon: "✅",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Pending",
      value: progress.assignments.pending,
      icon: "📝",
      color: "from-orange-500 to-red-500",
    },
  ];

  const hasAnyData =
    classes.length > 0 ||
    upcomingAssignments.length > 0 ||
    recentGrades.length > 0 ||
    upcomingExams.length > 0 ||
    practiceTests.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {getGreeting()}, {user.name}! 👋
          </h1>
          <p className="text-white/80">
            {progress.assignments.pending > 0
              ? `You have ${progress.assignments.pending} pending assignment${progress.assignments.pending === 1 ? "" : "s"}. Keep up the great work!`
              : "All caught up! No pending assignments right now."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      {!hasAnyData ? (
        <EmptyState
          title="Nothing to show yet"
          description="Once your teachers create classes, assignments, and exams, your dashboard will populate automatically."
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingAssignments.length > 0 && (
              <div className="card bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Upcoming Assignments</h2>
                  <Link href="/student/assignments" className="text-sm font-medium text-[var(--accent)] hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingAssignments.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.title}</div>
                        <div className="text-xs text-gray-400">
                          {a.subject.name} · Due {formatDate(a.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentGrades.length > 0 && (
              <div className="card bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Recent Grades</h2>
                  <Link href="/student/grades" className="text-sm font-medium text-[var(--accent)] hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentGrades.slice(0, 3).map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-sm font-bold">
                        {g.score != null ? Math.round((g.score / g.assignment.maxScore) * 100) : "—"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{g.assignment.title}</div>
                        <div className="text-xs text-gray-400">{g.assignment.subject.name}</div>
                      </div>
                      <div className="text-sm font-semibold text-[var(--accent)]">
                        {g.score != null ? `${g.score}/${g.assignment.maxScore}` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingAssignments.length === 0 && recentGrades.length === 0 && upcomingExams.length > 0 && (
              <div className="card bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Upcoming Exams</h2>
                </div>
                <div className="space-y-3">
                  {upcomingExams.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-xs text-gray-400">
                          {e.subject.name} · {e.examType} · {formatDate(e.examDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {practiceTests.length > 0 && (
              <div className="card bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Practice Tests</h2>
                </div>
                <div className="space-y-3">
                  {practiceTests.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.title}</div>
                        <div className="text-xs text-gray-400">
                          {p.subject.name} · {p.status}
                          {p.score != null && p.totalScore != null
                            ? ` · ${p.score}/${p.totalScore}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

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
