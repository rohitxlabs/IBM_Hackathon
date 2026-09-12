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
    percentage: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };
}

export function getSubjectAttendanceStats(): MockSubjectAttendanceStat[] {
  return [];
}
