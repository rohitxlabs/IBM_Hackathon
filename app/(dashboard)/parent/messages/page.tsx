"use client";

import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { mockTeachers } from "@/lib/mock-data/users";

export default function ParentMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with teachers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Teachers</h3>
          <div className="space-y-2">
            {mockTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-[var(--radius-sm)] cursor-pointer"
              >
                <Avatar alt={teacher.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{teacher.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {teacher.subjects[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Avatar alt={mockTeachers[0].name} size="sm" />
            <div>
              <h3 className="font-semibold text-gray-900">{mockTeachers[0].name}</h3>
              <p className="text-sm text-gray-500">{mockTeachers[0].subjects[0]}</p>
            </div>
          </div>

          <div className="h-[400px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              <p>Select a teacher to start messaging</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button>Send</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
