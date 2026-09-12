"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAssignmentsByStudent } from "@/lib/mock-data/assignments";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function ParentAssignmentsPage() {
  const assignments = getAssignmentsByStudent().slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Track your children's assignments and deadlines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} hover>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{assignment.subject}</p>
              </div>
              <Badge variant={getStatusColor(assignment.status) as any}>
                {assignment.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">
              {assignment.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Due: {formatDate(assignment.dueDate)}
              </div>
              {assignment.status === "graded" && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {assignment.score}/{assignment.maxScore}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
