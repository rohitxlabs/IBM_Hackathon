import type { Attendance } from "../types";

export const mockAttendance: Attendance[] = [
  {
    id: "att1",
    date: "2026-09-01",
    status: "present",
    subject: "Mathematics",
    class: "10A",
  },
  {
    id: "att2",
    date: "2026-09-01",
    status: "present",
    subject: "Physics",
    class: "10A",
  },
  {
    id: "att3",
    date: "2026-09-02",
    status: "late",
    subject: "English",
    class: "10A",
    remarks: "Arrived 10 minutes late",
  },
  {
    id: "att4",
    date: "2026-09-02",
    status: "present",
    subject: "Chemistry",
    class: "10A",
  },
  {
    id: "att5",
    date: "2026-09-03",
    status: "present",
    subject: "Mathematics",
    class: "10A",
  },
  {
    id: "att6",
    date: "2026-09-03",
    status: "absent",
    subject: "History",
    class: "10A",
    remarks: "Sick leave",
  },
  {
    id: "att7",
    date: "2026-09-04",
    status: "present",
    subject: "Biology",
    class: "10A",
  },
  {
    id: "att8",
    date: "2026-09-04",
    status: "present",
    subject: "Physics",
    class: "10A",
  },
  {
    id: "att9",
    date: "2026-09-05",
    status: "present",
    subject: "Mathematics",
    class: "10A",
  },
  {
    id: "att10",
    date: "2026-09-05",
    status: "present",
    subject: "English",
    class: "10A",
  },
  {
    id: "att11",
    date: "2026-08-29",
    status: "present",
    subject: "Mathematics",
    class: "10A",
  },
  {
    id: "att12",
    date: "2026-08-29",
    status: "present",
    subject: "Physics",
    class: "10A",
  },
  {
    id: "att13",
    date: "2026-08-30",
    status: "excused",
    subject: "Chemistry",
    class: "10A",
    remarks: "Medical appointment",
  },
  {
    id: "att14",
    date: "2026-08-30",
    status: "present",
    subject: "History",
    class: "10A",
  },
  {
    id: "att15",
    date: "2026-08-31",
    status: "present",
    subject: "Biology",
    class: "10A",
  },
];

export function getAttendanceByDate(date: string): Attendance[] {
  return mockAttendance.filter((a) => a.date === date);
}

export function getAttendanceBySubject(subject: string): Attendance[] {
  return mockAttendance.filter((a) => a.subject === subject);
}

export function getAttendanceStats() {
  const total = mockAttendance.length;
  const present = mockAttendance.filter((a) => a.status === "present").length;
  const absent = mockAttendance.filter((a) => a.status === "absent").length;
  const late = mockAttendance.filter((a) => a.status === "late").length;
  const excused = mockAttendance.filter((a) => a.status === "excused").length;

  const percentage = Math.round((present / total) * 100);

  return { total, present, absent, late, excused, percentage };
}

export function getSubjectAttendanceStats() {
  const subjects = [...new Set(mockAttendance.map((a) => a.subject).filter((s): s is string => s !== undefined))];
  
  return subjects.map((subject) => {
    const subjectAttendance = getAttendanceBySubject(subject);
    const present = subjectAttendance.filter((a) => a.status === "present").length;
    const total = subjectAttendance.length;
    const percentage = Math.round((present / total) * 100);

    return {
      subject,
      present,
      total,
      percentage,
    };
  });
}

export function getMonthlyAttendance(): { month: string; percentage: number }[] {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return months.map((month) => ({
    month,
    percentage: Math.floor(Math.random() * 10) + 85,
  }));
}
