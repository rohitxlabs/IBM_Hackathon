"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { mockStudents } from "@/lib/mock-data/users";

export default function TeacherStudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">View and manage all your students</p>
        </div>
        <Button>Add Student</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Student
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Class
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Roll No
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Performance
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar alt={student.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {student.class}{student.section}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {student.rollNumber}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={Math.random() > 0.5 ? "success" : "warning"}>
                      {Math.random() > 0.5 ? "Good" : "Average"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success" dot>Active</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">View</Button>
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
