"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { mockStudents } from "@/lib/mock-data/users";

export default function StudentProfilePage() {
  const student = mockStudents[0];

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
            <Avatar alt={student.name} size="xl" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {student.name}
            </h2>
            <p className="text-gray-600">{student.email}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                Class {student.class}{student.section}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Roll #{student.rollNumber}
              </span>
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
                defaultValue={student.name}
                className="block w-full rounded-[var(--radius-sm)] border border-gray-200 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue={student.email}
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
