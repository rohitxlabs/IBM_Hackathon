"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockStudents } from "@/lib/mock-data/users";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Mark and manage student attendance</p>
        </div>
        <Button>Save Attendance</Button>
      </div>

      <Card>
        <CardHeader
          title="Mark Attendance"
          description="Class 10A - Mathematics"
        />
        <div className="mt-4 space-y-3">
          {mockStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-[var(--radius-sm)]"
            >
              <div className="flex items-center gap-3">
                <Avatar alt={student.name} size="sm" />
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">Roll #{student.rollNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Present</Button>
                <Button variant="ghost" size="sm">Absent</Button>
                <Button variant="ghost" size="sm">Late</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
