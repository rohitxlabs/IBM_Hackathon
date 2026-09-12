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
} from "recharts";
import { mockPerformanceData } from "@/lib/mock-data/grades";

export default function ParentAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your children's academic progress</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Alex Johnson</h3>
          <span className="text-sm text-gray-500">Class 10A</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Performance Trend" description="Scores over time">
            <div className="h-[250px]">
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Attendance Trend" description="Attendance over time">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </Card>
    </div>
  );
}
