"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockTeachers } from "@/lib/mock-data/users";

export default function TeacherProfilePage() {
  const teacher = mockTeachers[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <Avatar alt={teacher.name} size="xl" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {teacher.name}
            </h2>
            <p className="text-gray-600">{teacher.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {teacher.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-2">
          <CardHeader title="Account Settings" />
          <div className="mt-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={teacher.name}
                className="block w-full rounded-[var(--radius-sm)] border border-gray-200 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue={teacher.email}
                className="block w-full rounded-[var(--radius-sm)] border border-gray-200 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="block w-full rounded-[var(--radius-sm)] border border-gray-200 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
