import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';

export interface FeeReport {
  totalInvoiced: number;
  totalCollected: number;
  pendingAmount: number;
  statusBreakdown: {
    paid: number;
    partial: number;
    due: number;
  };
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export const reportService = {
  getFeeReport: async (academicYearId: string): Promise<ApiResponse<FeeReport>> => {
    const response = await apiClient.get<ApiResponse<FeeReport>>('/reports/fees', {
      params: { academicYearId },
    });
    return response.data;
  },

  getAttendanceReport: async (params: { classSectionId: string; startDate?: string; endDate?: string }): Promise<ApiResponse<AttendanceSummary>> => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>('/reports/attendance', { params });
    return response.data;
  },

  getStudentProgress: async (studentId: string, academicYearId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/reports/student/${studentId}`, {
      params: { academicYearId },
    });
    return response.data;
  },
};
