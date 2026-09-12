"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  mockPerformanceData,
  mockSubjectPerformance,
} from "@/lib/mock-data/grades";

export default function StudentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your academic performance over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <ChartCard
          title="Performance Over Time"
          description="Your scores and attendance trends"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1" }}
                  name="Score"
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                  name="Attendance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Subject-wise Performance */}
        <ChartCard
          title="Subject Performance"
          description="Your scores by subject"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSubjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Strengths & Weaknesses */}
      <Card>
        <CardHeader
          title="Strengths & Areas for Improvement"
          description="Based on your recent performance"
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h4>
            <div className="space-y-2">
              {mockSubjectPerformance
                .filter((s) => s.score >= 85)
                .map((subject) => (
                  <div
                    key={subject.subject}
                    className="flex items-center justify-between p-3 bg-success-50 rounded-[var(--radius-sm)]"
                  >
                    <span className="font-medium text-gray-900">
                      {subject.subject}
                    </span>
                    <span className="font-semibold text-success-600">
                      {subject.score}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-warning-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {mockSubjectPerformance
                .filter((s) => s.score < 85)
                .map((subject) => (
                  <div
                    key={subject.subject}
                    className="flex items-center justify-between p-3 bg-warning-50 rounded-[var(--radius-sm)]"
                  >
                    <span className="font-medium text-gray-900">
                      {subject.subject}
                    </span>
                    <span className="font-semibold text-warning-600">
                      {subject.score}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
