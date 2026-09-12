"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api/client";
import type { ParentDashboard } from "@/lib/api/types";
import {
  LoadingPage,
  ErrorState,
} from "@/components/common";
import { EmptyState } from "@/components/ui";

export default function ParentDashboard() {
  const { user, status: sessionStatus } = useSession();
  const [dashboard, setDashboard] = useState<ParentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    let active = true;
    api.get<ParentDashboard>("/api/dashboard")
      .then((data) => {
        if (active) {
          setDashboard(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionStatus]);

  if (sessionStatus === "loading") {
    return <LoadingPage />;
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <ErrorState
        title="Not signed in"
        message="Please sign in to view your dashboard."
      />
    );
  }

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !dashboard) {
    return <ErrorState message={error ?? "Unable to load dashboard"} onRetry={() => window.location.reload()} />;
  }

  const children = dashboard.children ?? [];
  const avgProgressScore = children.length
    ? Math.round(
        children.reduce((sum, c) => {
          const avg = c.progress.assignments.averageScore ?? 0;
          const examAvg = c.progress.exams.averageScore ?? 0;
          return sum + (avg + examAvg) / 2;
        }, 0) / children.length
      )
    : 0;

  const totalRecentGrades = children.reduce(
    (sum, c) => sum + (c.recentGrades?.length ?? 0),
    0
  );
  const totalPendingHomework = children.reduce(
    (sum, c) => sum + (c.pendingHomework?.length ?? 0),
    0
  );
  const flatRecentGrades = children.flatMap((c) =>
    (c.recentGrades ?? []).map((g) => ({
      ...g,
      childName: c.student.name,
    }))
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[var(--parent-accent)] to-rose-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome back, {user?.name ?? "Parent"}! 👨‍👩‍👧
          </h1>
          <p className="text-white/80">
            Track your children&apos;s progress, attendance, and academic
            performance — all in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Children",
            value: children.length,
            icon: "👧",
            color: "from-pink-500 to-rose-500",
          },
          {
            label: "Avg Grade",
            value: children.length ? `${avgProgressScore}%` : "—",
            icon: "📊",
            color: "from-purple-500 to-indigo-500",
          },
          {
            label: "Pending Work",
            value: totalPendingHomework,
            icon: "✅",
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Messages",
            value: dashboard.unreadMessages ?? 0,
            icon: "💬",
            color: "from-blue-500 to-cyan-500",
          },
        ].map((stat) => (
          <div key={stat.label} className="card bg-white">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg`}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              My Children
            </h2>
            <Link
              href="/parent/children"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View All
            </Link>
          </div>
          {children.length === 0 ? (
            <EmptyState
              title="No children linked yet"
              description="Link your children using their student access code to see their progress here."
            />
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.student.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--parent-accent)] to-rose-400 flex items-center justify-center text-white text-sm font-bold">
                    {child.student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {child.student.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Grade {child.student.gradeLevel} · Roll {child.student.rollNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-500">
                      {child.progress.assignments.averageScore
                        ? `${Math.round(child.progress.assignments.averageScore)}%`
                        : "—"}
                    </div>
                    <div className="text-[10px] text-gray-400">Performance</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Recent Results
            </h2>
            <Link
              href="/parent/results"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View All
            </Link>
          </div>
          {totalRecentGrades === 0 ? (
            <EmptyState
              title="No results yet"
              description="Results from exams and assessments will appear here."
            />
          ) : (
            <div className="space-y-3">
              {flatRecentGrades.map((g, idx) => (
                <div
                  key={`${g.id}-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center text-white text-sm font-bold">
                    {g.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {g.exam.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {g.childName} · Grade {g.grade ?? "—"}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--accent)]">
                    {g.score}/{g.exam.maxScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-white">
        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quick Actions
        </h2>
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
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--foreground)]">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
