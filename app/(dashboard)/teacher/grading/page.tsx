"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockStudents } from "@/lib/mock-data/users";

export default function TeacherGradingPage() {
  const pendingSubmissions = [
    { student: mockStudents[0], assignment: "Quadratic Equations Problem Set", submitted: "2026-09-05" },
    { student: mockStudents[1], assignment: "Newton's Laws Lab Report", submitted: "2026-09-04" },
    { student: mockStudents[2], assignment: "Essay: Shakespeare's Hamlet", submitted: "2026-09-03" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grading</h1>
        <p className="text-gray-600">Review and grade student submissions</p>
      </div>

      {/* AI Grading Section */}
      <Card className="border-2 border-accent-200 bg-accent-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent-100 rounded-full">
            <svg className="w-6 h-6 text-accent-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">AI-Powered Grading</h3>
            <p className="text-sm text-gray-600 mt-1">
              Let Jinni AI help you grade assignments faster. Upload submissions and get instant feedback suggestions.
            </p>
            <Button className="mt-3" size="sm">
              Try AI Grading
            </Button>
          </div>
        </div>
      </Card>

      {/* Pending Submissions */}
      <Card>
        <CardHeader
          title="Pending Submissions"
          description={`${pendingSubmissions.length} submissions awaiting review`}
        />
        <div className="mt-4 space-y-4">
          {pendingSubmissions.map((submission, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-[var(--radius-md)]"
            >
              <div className="flex items-center gap-4">
                <Avatar alt={submission.student.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900">
                    {submission.student.name}
                  </p>
                  <p className="text-sm text-gray-500">{submission.assignment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted: {submission.submitted}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button size="sm">Grade</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
