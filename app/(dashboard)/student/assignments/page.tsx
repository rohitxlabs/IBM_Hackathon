"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { getAssignmentsByStudent } from "@/lib/mock-data/assignments";
import { formatDate, getStatusColor } from "@/lib/utils";

export default function StudentAssignmentsPage() {
  const [filter, setFilter] = useState("all");
  const assignments = getAssignmentsByStudent();

  const filteredAssignments =
    filter === "all"
      ? assignments
      : assignments.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">View and submit your assignments</p>
      </div>

      <Tabs defaultValue="all" onChange={(value) => setFilter(value)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} hover>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {assignment.subject}
                    </p>
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
                  {assignment.status === "pending" && (
                    <Button size="sm">Submit</Button>
                  )}
                </div>
                {assignment.feedback && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-[var(--radius-sm)]">
                    <p className="text-sm font-medium text-gray-700">Feedback:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {assignment.feedback}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
