"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { mockParents } from "@/lib/mock-data/users";

export default function ParentChildrenPage() {
  const parent = mockParents[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-600">View detailed information about your children</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parent.children.map((child) => (
          <Card key={child.id}>
            <div className="flex items-start gap-4">
              <Avatar alt={child.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                <p className="text-gray-600">
                  Class {child.class}{child.section} • Roll #{child.rollNumber}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="success" dot>Active</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Attendance</span>
                  <span className="text-sm font-medium text-gray-900">94%</span>
                </div>
                <Progress value={94} color="success" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Average Grade</span>
                  <span className="text-sm font-medium text-gray-900">87%</span>
                </div>
                <Progress value={87} color="primary" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-[var(--radius-sm)] text-center">
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-gray-500">Pending Tasks</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-[var(--radius-sm)] text-center">
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">Upcoming Tests</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
