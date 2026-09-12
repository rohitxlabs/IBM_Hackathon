"use client";

import { Card } from "@/components/ui/Card";
import { getNotifications } from "@/lib/mock-data/notifications";
import { getRelativeTime } from "@/lib/utils";

export default function ParentNoticesPage() {
  const notifications = getNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-600">View all notifications and school announcements</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${
              !notification.read ? "border-l-4 border-l-primary-500" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {getRelativeTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
