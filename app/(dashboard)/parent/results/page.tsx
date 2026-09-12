"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockGrades, getAverageGrade, mockSubjectPerformance } from "@/lib/mock-data/grades";
import { formatDate } from "@/lib/utils";

export default function ParentResultsPage() {
  const averageGrade = getAverageGrade();
  const subjectPerformance = mockSubjectPerformance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="text-gray-600">View your children's academic performance</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alex Johnson</h3>
            <p className="text-gray-600">Class 10A</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">{averageGrade}%</div>
            <Badge variant={averageGrade >= 90 ? "success" : "warning"}>
              {averageGrade >= 90 ? "Excellent" : "Good"}
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Subject Performance" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectPerformance.map((subject) => (
            <div key={subject.subject} className="p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                {subject.trend === "up" && (
                  <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{subject.score}%</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent Grades" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Assessment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{grade.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{grade.subject}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(grade.date)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${grade.score >= 90 ? "text-success-600" : "text-warning-600"}`}>
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
