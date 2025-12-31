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
};
