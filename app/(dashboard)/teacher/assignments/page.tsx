"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getAssignmentsByStudent } from "@/lib/mock-data/assignments";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const assignments = getAssignmentsByStudent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Assignment</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Subject
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Submissions
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
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {assignment.subject}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(assignment.dueDate)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {assignment.status === "submitted" ? "1" : "0"}/25
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusColor(assignment.status) as any}>
                      {assignment.status}
                    </Badge>
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

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-[var(--radius-lg)] w-full max-w-lg p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900">Create Assignment</h2>
            <div className="mt-4 space-y-4">
              <Input label="Title" placeholder="Assignment title" />
              <Input label="Description" placeholder="Assignment description" />
              <Select
                label="Subject"
                placeholder="Select subject"
                options={[
                  { value: "math", label: "Mathematics" },
                  { value: "physics", label: "Physics" },
                  { value: "english", label: "English" },
                  { value: "chemistry", label: "Chemistry" },
                ]}
              />
              <Input label="Due Date" type="date" />
              <Input label="Max Score" type="number" placeholder="100" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
