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

  createHomework: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/teachers/homework', data);
    return response.data;
  },


  getTeacherHomeworks: async (teacherId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/teachers/homework/${teacherId}`);
    return response.data;
  },

  homeworkStatus: async (id: string, status: string, classSectionId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/students/homework/create-status/${id}`, { status, classSectionId });
    return response.data;
  },

  getTeacherHomeworksByClassSectionId: async (classSectionId: string, homeworkId: string, teacherId: string, status: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/teachers/homework-status/students/', {
      params: {
        classSectionId: classSectionId,
        homeworkId: homeworkId,
        teacherId: teacherId,
        status: status,
      }
    });
    return response.data;
  },
};
