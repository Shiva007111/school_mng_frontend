import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type { 
  AttendanceEvent, 
  MarkAttendanceRequest, 
  BulkMarkAttendanceRequest,
  StudentAttendanceReport
} from '@/types/attendance.types';

export const attendanceService = {
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
