import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  AttendanceEvent,
  TeacherAttendance,
  MarkAttendanceRequest,
  MarkTeacherAttendanceRequest,
  BulkMarkAttendanceRequest,
  StudentAttendanceReport
} from '@/types/attendance.types';

export const attendanceService = {

  // getTodayTeacherAttendance: async (teacherId: string): Promise<ApiResponse<TeacherAttendance>> => {
  //   const response = await apiClient.get<ApiResponse<TeacherAttendance>>(`/attendance/teacher/today/${teacherId}`);
  //   return response.data;
  // },
  markTeacherAttendance: async (data: MarkTeacherAttendanceRequest): Promise<ApiResponse<{ marked: boolean; attendance: TeacherAttendance }>> => {
    const response = await apiClient.post<ApiResponse<{ marked: boolean; attendance: TeacherAttendance }>>('/attendance/teacher', data);
    return response.data;
  },

  markAttendance: async (data: MarkAttendanceRequest): Promise<ApiResponse<AttendanceEvent>> => {
    const response = await apiClient.post<ApiResponse<AttendanceEvent>>('/attendance', data);
    return response.data;
  },

  bulkMarkAttendance: async (data: BulkMarkAttendanceRequest): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.post<ApiResponse<{ count: number }>>('/attendance/bulk', data);
    return response.data;
  },

  getStudentHistory: async (studentId: string, startDate?: string, endDate?: string): Promise<ApiResponse<AttendanceEvent[]>> => {
    const response = await apiClient.get<ApiResponse<AttendanceEvent[]>>(`/attendance/student/${studentId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getClassDailyReport: async (classSectionId: string, date: string): Promise<ApiResponse<StudentAttendanceReport[]>> => {
    const response = await apiClient.get<ApiResponse<StudentAttendanceReport[]>>(`/attendance/class/${classSectionId}/daily`, {
      params: { date },
    });
    return response.data;
  },
};
