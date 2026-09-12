export type MockAttendanceStats = {
  percentage: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
};

export type MockSubjectAttendanceStat = {
  subject: string;
  percentage: number;
  present: number;
  absent: number;
  late: number;
};

export function getAttendanceStats(): MockAttendanceStats {
  return {
    percentage: 94,
    present: 141,
    absent: 5,
    late: 3,
    excused: 2,
  };
}

export function getSubjectAttendanceStats(): MockSubjectAttendanceStat[] {
  return [
    { subject: "Mathematics", percentage: 96, present: 24, absent: 1, late: 0 },
    { subject: "Physics", percentage: 92, present: 23, absent: 2, late: 0 },
    { subject: "English Literature", percentage: 95, present: 19, absent: 1, late: 0 },
    { subject: "Chemistry", percentage: 88, present: 22, absent: 2, late: 1 },
    { subject: "Biology", percentage: 97, present: 29, absent: 0, late: 1 },
    { subject: "History", percentage: 91, present: 20, absent: 1, late: 1 },
    { subject: "Computer Science", percentage: 100, present: 18, absent: 0, late: 0 },
  ];
}
