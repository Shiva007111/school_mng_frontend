import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';

export const dashboardService = {
  getAdminStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/admin');
    return response.data;
  },

  getTeacherStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/teacher');
    return response.data;
  },

  getParentStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/parent');
    return response.data;
  },

  getStudentStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/student');
    return response.data;
  },

  postTeacherLeaveRequest: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/teachers/leave', data);
    return response.data;
  },

  putAdminResponse: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>('/teachers/leave/admin-response', data);
    return response.data;
  },

  getTeacherLeaves: async (status: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/teachers/leave/history', {
      params: {
        status: status
      }
    });
    return response.data;
  },

  getTeacherLeavesById: async (teacherId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/teachers/leave/history-by-id', {
      params: {
        teacherId: teacherId,
      }
    });
    return response.data;
  },

};
