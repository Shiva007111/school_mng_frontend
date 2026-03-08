export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  latitude: number | null;
  longitude: number | null;
  markedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceEvent {
  id: string;
  studentId: string;
  timetablePeriodId?: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedAt?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    id: string;
    admissionNo: string;
    user?: {
      email: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface MarkAttendanceRequest {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  timetablePeriodId?: string;
  remarks?: string;
}
export interface MarkTeacherAttendanceRequest {
  latitude: number;
  longitude: number;
  teacherId: string;
  date: string;
}

export interface BulkMarkAttendanceRequest {
  events: MarkAttendanceRequest[];
}

export interface StudentAttendanceReport {
  student: {
    id: string;
    admissionNo: string;
    user?: {
      email: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
    };
  };
  attendance: AttendanceEvent | null;
}
