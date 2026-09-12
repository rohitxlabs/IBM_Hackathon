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

const classPerformance = [
  { month: "Apr", average: 72, attendance: 88 },
  { month: "May", average: 75, attendance: 90 },
  { month: "Jun", average: 78, attendance: 92 },
  { month: "Jul", average: 80, attendance: 89 },
  { month: "Aug", average: 82, attendance: 91 },
  { month: "Sep", average: 85, attendance: 93 },
];

const subjectWeakness = [
  { subject: "Algebra", weakness: 35 },
  { subject: "Geometry", weakness: 25 },
  { subject: "Calculus", weakness: 45 },
  { subject: "Statistics", weakness: 20 },
];

export default function TeacherAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track class performance and identify areas for improvement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance Over Time */}
        <ChartCard
          title="Class Performance"
          description="Average scores and attendance trends"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1" }}
                  name="Average Score"
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

        {/* Weak Topics */}
        <ChartCard
          title="Weak Topics Detection"
          description="Topics where students need extra help"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectWeakness}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="weakness" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Weakness %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Student Performance Summary */}
      <Card>
        <CardHeader
          title="Student Performance Summary"
          description="Overview of all students in your classes"
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Student</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Class</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Average</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Attendance</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[72, 88, 95, 68, 82].map((score, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    Student {index + 1}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">10A</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{score}%</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{85 + index}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      score >= 80 ? "bg-success-100 text-success-700" :
                      score >= 60 ? "bg-warning-100 text-warning-600" :
                      "bg-danger-100 text-danger-600"
                    }`}>
                      {score >= 80 ? "Good" : score >= 60 ? "Average" : "Needs Help"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
