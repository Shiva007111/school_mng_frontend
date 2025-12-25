export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceEvent {
  id: string;
  studentId: string;
  timetablePeriodId?: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  student?: {
    id: string;
    admissionNo: string;
    user?: {
      email: string;
      phone?: string;
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
    };
  };
  attendance: AttendanceEvent | null;
}
