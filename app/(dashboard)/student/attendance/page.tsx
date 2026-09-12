"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import {
  getAttendanceStats,
  getSubjectAttendanceStats,
} from "@/lib/mock-data/attendance";

export default function StudentAttendancePage() {
  const stats = getAttendanceStats();
  const subjectStats = getSubjectAttendanceStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Track your attendance across all subjects</p>
      </div>

      {/* Overall Attendance */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Attendance
            </h3>
            <p className="text-gray-600">
              You&apos;re doing great! Keep it up.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {stats.percentage}%
            </div>
            <p className="text-sm text-gray-500">This semester</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress
            value={stats.percentage}
            color={stats.percentage >= 90 ? "success" : stats.percentage >= 75 ? "warning" : "danger"}
            size="lg"
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-success-50 rounded-[var(--radius-sm)]">
            <p className="text-2xl font-bold text-success-600">{stats.present}</p>
            <p className="text-xs text-gray-500">Present</p>
          </div>
          <div className="p-3 bg-danger-50 rounded-[var(--radius-sm)]">
            <p className="text-2xl font-bold text-danger-600">{stats.absent}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </div>
          <div className="p-3 bg-warning-50 rounded-[var(--radius-sm)]">
            <p className="text-2xl font-bold text-warning-600">{stats.late}</p>
            <p className="text-xs text-gray-500">Late</p>
          </div>
          <div className="p-3 bg-secondary-50 rounded-[var(--radius-sm)]">
            <p className="text-2xl font-bold text-secondary-600">{stats.excused}</p>
            <p className="text-xs text-gray-500">Excused</p>
          </div>
        </div>
      </Card>

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader
          title="Subject-wise Attendance"
          description="Your attendance for each subject"
        />
        <div className="mt-4 space-y-4">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <p className="font-medium text-gray-900">{stat.subject}</p>
              </div>
              <div className="flex-1">
                <Progress
                  value={stat.percentage}
                  color={stat.percentage >= 90 ? "success" : stat.percentage >= 75 ? "warning" : "danger"}
                />
              </div>
              <div className="w-16 text-right">
                <p className="font-semibold text-gray-900">{stat.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
