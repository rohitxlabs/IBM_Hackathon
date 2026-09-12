"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCoursesByTeacher } from "@/lib/mock-data/courses";
import { getStudentsByClass } from "@/lib/mock-data/users";

export default function TeacherClassesPage() {
  const courses = getCoursesByTeacher("t1");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600">Manage your classes and view student rosters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const students = getStudentsByClass(course.class);
          return (
            <Card key={course.id} hover>
              <div className={`h-2 -mx-5 -mt-5 mb-4 ${course.color}`} />
              <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Class {course.class}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {course.schedule}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {course.room}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="primary">{students.length} Students</Badge>
                <span className="text-sm text-gray-500">{course.room}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
