import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type { Student } from '@/types/student.types';

export const parentService = {
  // Get children for the logged-in parent
  getMyChildren: async (): Promise<ApiResponse<Student[]>> => {
    const response = await apiClient.get<ApiResponse<Student[]>>('/parents/me/children');
    return response.data;
  },
};
