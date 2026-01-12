import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type { Student, Parent } from '@/types/student.types';

export const parentService = {
  // Get all parents
  getParents: async (): Promise<ApiResponse<Parent[]>> => {
    const response = await apiClient.get<ApiResponse<Parent[]>>('/parents');
    return response.data;
  },

  // Get children for the logged-in parent
  getMyChildren: async (): Promise<ApiResponse<Student[]>> => {
    const response = await apiClient.get<ApiResponse<Student[]>>('/parents/me/children');
    return response.data;
  },

  // Create a new parent
  createParent: async (data: any): Promise<ApiResponse<Parent>> => {
    const response = await apiClient.post<ApiResponse<Parent>>('/parents', data);
    return response.data;
  },

  // Update parent
  updateParent: async (id: string, data: any): Promise<ApiResponse<Parent>> => {
    const response = await apiClient.put<ApiResponse<Parent>>(`/parents/${id}`, data);
    return response.data;
  },
};
