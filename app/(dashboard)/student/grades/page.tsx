"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  mockGrades,
  getAverageGrade,
  mockSubjectPerformance,
} from "@/lib/mock-data/grades";
import { formatDate } from "@/lib/utils";

export default function StudentGradesPage() {
  const averageGrade = getAverageGrade();
  const subjectPerformance = mockSubjectPerformance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
        <p className="text-gray-600">View your academic performance</p>
      </div>

      {/* Average Grade */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Overall Average
            </h3>
            <p className="text-gray-600">Your current academic standing</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {averageGrade}%
            </div>
            <Badge
              variant={averageGrade >= 90 ? "success" : averageGrade >= 70 ? "warning" : "danger"}
            >
              {averageGrade >= 90
                ? "Excellent"
                : averageGrade >= 70
                ? "Good"
                : "Needs Improvement"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader
          title="Subject Performance"
          description="How you're doing in each subject"
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectPerformance.map((subject) => (
            <div
              key={subject.subject}
              className="p-4 bg-gray-50 rounded-[var(--radius-md)]"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                <div className="flex items-center gap-1">
                  {subject.trend === "up" && (
                    <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  )}
                  {subject.trend === "down" && (
                    <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {subject.score}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Grades */}
      <Card>
        <CardHeader
          title="Recent Grades"
          description="Your latest grades and scores"
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Assessment
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Subject
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {grade.title}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {grade.subject}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="default" size="sm">
                      {grade.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(grade.date)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        grade.score >= 90
                          ? "text-success-600"
                          : grade.score >= 70
                          ? "text-warning-600"
                          : "text-danger-600"
                      }`}
                    >
                      {grade.score}/{grade.maxScore}
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
